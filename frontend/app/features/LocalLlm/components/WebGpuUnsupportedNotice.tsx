import { MonitorX } from 'lucide-react';
import { cn } from '~/lib/cn';

type Props = {
  className?: string;
};

/**
 * WebGPU が使えないときの案内。生成はブラウザの中で動くモデルだけで行い、
 * テンプレートの生成器には落とさない（どちらで作ったか分からなくなるため）。
 *
 * 入力をすべて済ませてから断られないよう、ウィザードの最初から出す。
 */
export function WebGpuUnsupportedNotice({ className }: Props) {
  return (
    <div
      role='alert'
      className={cn(
        'flex gap-xs rounded-md border border-danger bg-white p-sm',
        className,
      )}
    >
      <MonitorX size={20} className='shrink-0 text-danger' aria-hidden />
      <div className='flex flex-col gap-xxs text-xs leading-md text-black'>
        <p className='font-bold text-danger'>
          このブラウザでは文章を作成できません
        </p>
        <p>
          文章はブラウザの中で動くAI（WebGPU）で作成します。次のいずれかで開いてください。
        </p>
        <ul className='list-disc pl-md'>
          <li>Chrome / Edge 113 以降</li>
          <li>Safari 26 以降（macOS / iOS）</li>
          <li>Firefox 141 以降（Windows）</li>
        </ul>
        <p className='text-font-gray'>
          HTTPS か localhost で開いている必要があります。
        </p>
      </div>
    </div>
  );
}
