import type { CSSProperties, MutableRefObject, ReactElement, Ref } from 'react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type DropdownAlign = 'start' | 'end';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]:not([href=""])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusableIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.closest('[inert], [aria-hidden="true"]')) {
      return false;
    }
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') {
      return false;
    }
    return true;
  });
}

export type DropdownTriggerRenderProps = {
  ref: Ref<HTMLButtonElement>;
  type: 'button';
  onClick: () => void;
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-haspopup': 'dialog';
  id: string;
};

export type DropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  align?: DropdownAlign;
  trigger: (props: DropdownTriggerRenderProps) => ReactElement;
  children: React.ReactNode;
  panelClassName?: string;
  panelStyle?: CSSProperties;
};

const PANEL_GAP = 8;
const VIEW_MARGIN = 8;

export function Dropdown({
  open,
  onOpenChange,
  align = 'start',
  trigger,
  children,
  panelClassName = 'dropdown-panel',
  panelStyle: panelStyleProp,
}: DropdownProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null) as MutableRefObject<HTMLButtonElement | null>;
  const panelRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const safeId = reactId.replace(/:/g, '');
  const panelDomId = `dropdown-panel-${safeId}`;
  const triggerDomId = `dropdown-trigger-${safeId}`;

  const [panelBox, setPanelBox] = useState({
    top: 0,
    left: 0,
    minWidth: 0,
    maxWidth: 400,
  });

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const update = () => {
      const btn = triggerRef.current;
      if (!btn) {
        return;
      }
      const panel = panelRef.current;
      const r = btn.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxW = Math.max(VIEW_MARGIN * 2, vw - VIEW_MARGIN * 2);
      const measuredW = panel ? Math.min(panel.scrollWidth, maxW) : Math.max(r.width, 240);
      const panelW = Math.min(Math.max(measuredW, r.width), maxW);
      const panelH = panel?.offsetHeight ?? 0;

      let left = align === 'start' ? r.left : r.right - panelW;
      if (left + panelW > vw - VIEW_MARGIN) {
        left = vw - VIEW_MARGIN - panelW;
      }
      if (left < VIEW_MARGIN) {
        left = VIEW_MARGIN;
      }

      let top = r.bottom + PANEL_GAP;
      if (panelH > 0 && top + panelH > vh - VIEW_MARGIN) {
        const above = r.top - PANEL_GAP - panelH;
        if (above >= VIEW_MARGIN) {
          top = above;
        }
      }

      setPanelBox({
        top,
        left,
        minWidth: Math.max(r.width, 200),
        maxWidth: maxW,
      });
    };

    update();

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, align]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current) {
      return;
    }
    const panel = panelRef.current;
    const focusables = getFocusableIn(panel);
    const target = focusables[0] ?? panel;
    target.focus({ preventScroll: true });
  }, [open, children]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onMouseDown = (e: MouseEvent) => {
      const n = e.target as Node;
      if (triggerRef.current?.contains(n)) {
        return;
      }
      if (panelRef.current?.contains(n)) {
        return;
      }
      onOpenChange(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  const setRefs = (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
  };

  const triggerProps: DropdownTriggerRenderProps = {
    ref: setRefs,
    type: 'button',
    onClick: () => {
      onOpenChange(!open);
    },
    'aria-expanded': open,
    'aria-controls': panelDomId,
    'aria-haspopup': 'dialog',
    id: triggerDomId,
  };

  const mergedPanelStyle: CSSProperties = {
    position: 'fixed',
    top: panelBox.top,
    left: panelBox.left,
    minWidth: panelBox.minWidth,
    maxWidth: panelBox.maxWidth,
    zIndex: 1000,
    ...panelStyleProp,
  };

  const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) {
      return;
    }
    const list = getFocusableIn(panelRef.current);
    if (list.length === 0) {
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !panelRef.current.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        id={panelDomId}
        role="region"
        aria-labelledby={triggerDomId}
        tabIndex={-1}
        className={panelClassName}
        style={mergedPanelStyle}
        onKeyDown={handlePanelKeyDown}
      >
        {children}
      </div>,
      document.body
    );

  return (
    <>
      {trigger(triggerProps)}
      {panel}
    </>
  );
}
