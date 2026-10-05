import { ChevronDown, Cpu } from 'lucide-react';
import {
  findModel,
  LLM_MODELS,
  type LlmModelId,
} from '~/features/LocalLlm/constants';

type Props = {
  value: LlmModelId;
  onChange: (id: LlmModelId) => void;
  disabled?: boolean;
};

/**
 * 使っているモデルの表示と切り替え。どのモデルが答えているかを常に見せる。
 * 選択肢は少なく、モバイルでも OS 標準のピッカーが出るよう native の select を使う。
 */
export function ModelSelect({ value, onChange, disabled = false }: Props) {
  const current = findModel(value);

  return (
    <label className='relative inline-flex w-fit items-center gap-xxs rounded-infinity border border-border-2 bg-white py-xxs pr-xl pl-xs text-xs font-bold text-black has-[:disabled]:text-font-gray'>
      <Cpu size={14} className='shrink-0 text-primary' aria-hidden />
      <span>{current.label}</span>
      <ChevronDown
        size={14}
        className='pointer-events-none absolute right-xs'
        aria-hidden
      />
      <select
        aria-label='生成に使うモデル'
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as LlmModelId)}
        className='absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed'
      >
        {LLM_MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}（{m.note}）
          </option>
        ))}
      </select>
    </label>
  );
}
