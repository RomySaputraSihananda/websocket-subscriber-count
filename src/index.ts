import WebSocket, { WebSocketServer, ServerOptions, RawData } from "ws";

class MyWebSocketServer {
  private websocketServer: WebSocketServer;
  private running: boolean = true;

  constructor(options: ServerOptions) {
    this.websocketServer = new WebSocketServer(options, () => {
      const { host, port } = this.websocketServer.options;
      console.log(
        `websocket is running on ws://${host ? host : "localhost"}:${port}`
      );
    });
    this.setupEvents();
  }

  /**
   * setupEvents
   */
  private setupEvents(): void {
    this.websocketServer.on("connection", (socket: WebSocket) => {
      console.log("A new client connected.");
      this.running = true;
      socket.on("message", this.handlerMessage.bind(this, socket));
      socket.on("close", this.handlerClose.bind(this, socket));
    });
  }

  private async handlerMessage(
    socket: WebSocket,
    message: RawData
  ): Promise<void> {
    while (this.running) {
      const { id, sleep } = JSON.parse(message.toString());
      console.log(id);
      const response: Response = await this.getSubscriber(id);
      if (response.status !== 200) break;
      socket.send(JSON.stringify(await response.json()));
      await this.sleep(sleep);
    }
  }
  private handlerClose(socket: WebSocket, message: RawData): void {
    this.running = false;
  }

  /**
   * Pauses execution for a specified number of milliseconds.
   * @param ms - The number of milliseconds to sleep.
   * @returns A promise that resolves after the specified delay.
   */
  public sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async getSubscriber(id: string): Promise<Response> {
    return fetch(
      `https://api.socialcounts.org/youtube-live-subscriber-count/${id}`
    );
  }
}

new MyWebSocketServer({
  host: "0.0.0.0",
  port: 9090,
});
