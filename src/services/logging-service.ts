import { OutputChannel, window } from 'vscode';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export class Logger {
  constructor(
    private channel: OutputChannel = window.createOutputChannel('Modern Fortran'),
    private level: LogLevel = LogLevel.INFO
  ) {}

  public setLogLevel(logLevel: LogLevel) {
    this.level = logLevel;
  }

  public getLogLevel(): LogLevel {
    return this.level;
  }

  public getOutputChannel(): OutputChannel {
    return this.channel;
  }

  public debug(message: string, data?: unknown): void {
    if (this.level > LogLevel.DEBUG) return;
    this.log(message, LogLevel.DEBUG);
    if (data) {
      this.logObject(data);
    }
  }

  public info(message: string, data?: unknown): void {
    if (this.level > LogLevel.INFO) return;
    this.log(message, LogLevel.INFO);
    if (data) {
      this.logObject(data);
    }
  }

  public warn(message: string, data?: unknown): void {
    if (this.level > LogLevel.WARN) return;
    this.log(message, LogLevel.WARN);
    if (data) {
      this.logObject(data);
    }
  }

  public error(message: string, error?: Error | string) {
    if (this.level > LogLevel.ERROR) return;
    this.log(message, LogLevel.ERROR);

    if (typeof error === 'string') {
      // Errors as a string usually only happen with
      // plugins that don't return the expected error.
      this.channel.appendLine(error);
    } else if (error?.message || error?.stack) {
      if (error?.message) {
        this.log(error.message, LogLevel.ERROR);
      }
      if (error?.stack) {
        this.channel.appendLine(error.stack);
      }
    } else if (error) {
      this.logObject(error);
    }
  }

  public show() {
    this.channel.show();
  }

  private logObject(data: unknown): void {
    const message = JSON.stringify(data, null, 2);
    this.channel.appendLine(message);
  }

  private log(message: string, level: LogLevel): void {
    const title = new Date().toLocaleTimeString();
    this.channel.appendLine(`[${LogLevel[level]} - ${title}] ${message}`);
  }
}
