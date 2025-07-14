declare module "chitragupta" {
  interface FormatterOptions {
    level: string;
    message: string;
    meta: any;
  }

  export class Chitragupta {
    static jsonLogFormatter(options: FormatterOptions): string;
  }
}
