import { useEffect, useState } from 'react';

export type WebGpuSupport = 'checking' | 'supported' | 'unsupported';

type GpuNavigator = Navigator & {
  gpu?: { requestAdapter(): Promise<unknown | null> };
};

let cached: Promise<boolean> | null = null;

/**
 * WebGPU が使えるか。`navigator.gpu` があってもアダプタが取れない端末
 * （GPU がブロックリスト入り等）があるので、requestAdapter まで試す。
 * 結果は変わらないのでアプリ全体で1回だけ判定する。
 */
export function detectWebGpu(): Promise<boolean> {
  if (!cached) {
    cached = (async () => {
      if (typeof navigator === 'undefined') return false;
      // secure context（HTTPS か localhost）でないと navigator.gpu 自体が無い
      const gpu = (navigator as GpuNavigator).gpu;
      if (!gpu) return false;
      try {
        return (await gpu.requestAdapter()) !== null;
      } catch {
        return false;
      }
    })();
  }
  return cached;
}

export function useWebGpuSupport(): WebGpuSupport {
  const [support, setSupport] = useState<WebGpuSupport>('checking');

  useEffect(() => {
    let active = true;
    detectWebGpu().then((ok) => {
      if (active) setSupport(ok ? 'supported' : 'unsupported');
    });
    return () => {
      active = false;
    };
  }, []);

  return support;
}
