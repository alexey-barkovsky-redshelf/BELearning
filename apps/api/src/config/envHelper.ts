export class EnvHelper {
  public static getPort(): number {
    return Number(process.env.PORT) || 3000;
  }
}
