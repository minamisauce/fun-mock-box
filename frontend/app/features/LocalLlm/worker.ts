import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm';

// 推論は数十億回の行列積なので、UI スレッドから外して Worker で回す。
// メインスレッド側の WebWorkerMLCEngine とはメッセージでやりとりするだけ
const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (event: MessageEvent) => {
  handler.onmessage(event);
};
