import { useState } from 'react';
import { ConsentNotice } from '~/components/ConsentNotice';
import {
  experience,
  type Industry,
  industry,
  reason,
  SECTORS_BY_INDUSTRY,
  SuggestExperienceMaxCount,
} from '~/features/Motivation/constants/inputText';
import { useMotivationForm } from '~/features/Motivation/hooks/useMotivationForm';
import { SelectStep } from '~/features/ToolWizard/SelectStep';
import { TextStep } from '~/features/ToolWizard/TextStep';
import type { StepComponentProps } from '~/features/ToolWizard/types';

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ label: value, value }));

const industryOptions = toOptions(industry);
const reasonOptions = toOptions(reason);

export function SelectIndustry({ label, handleNextStep }: StepComponentProps) {
  const { values, setValue } = useMotivationForm();

  const handleSelect = (value: string) => {
    // 業界を変えたら業種は選び直しになるのでクリアする
    if (values.industry && values.industry !== value) {
      setValue('sector', '');
    }
    setValue('industry', value);
    handleNextStep();
  };

  return (
    <SelectStep
      label={label}
      options={industryOptions}
      onSelect={handleSelect}
    />
  );
}

export function SelectSector({ label, handleNextStep }: StepComponentProps) {
  const { values, setValue } = useMotivationForm();
  const sectors = SECTORS_BY_INDUSTRY[values.industry as Industry] ?? [];

  const handleSelect = (value: string) => {
    setValue('sector', value);
    handleNextStep();
  };

  return (
    <SelectStep
      label={label}
      options={toOptions(sectors)}
      onSelect={handleSelect}
    />
  );
}

export function SelectReason({ label, handleNextStep }: StepComponentProps) {
  const { setValue } = useMotivationForm();

  const handleSelect = (value: string) => {
    setValue('reason', value);
    handleNextStep();
  };

  return (
    <SelectStep
      label={label}
      options={reasonOptions}
      onSelect={handleSelect}
      columns={1}
    />
  );
}

/**
 * 最終ステップ。生成AIへの送信に同意するまで作成ボタンを押せない。
 * Figma: 自己PRツール node 3578:22404（consent ブロック）
 */
export function SelectExperience({
  label,
  handleNextStep,
  isSubmitting,
}: StepComponentProps) {
  const { values, setValue } = useMotivationForm();
  const [agreed, setAgreed] = useState(false);

  return (
    <TextStep
      label={label}
      value={values.experience ?? ''}
      onChange={(next) => setValue('experience', next)}
      placeholder='例）リーグ優勝に導いた経験'
      candidates={experience}
      suggestMaxCount={SuggestExperienceMaxCount}
      onNext={handleNextStep}
      nextText='志望動機を作成する'
      isSubmitting={isSubmitting}
      beforeAction={
        <ConsentNotice
          toolName='志望動機'
          agreed={agreed}
          onChange={setAgreed}
        />
      }
      disabled={!agreed}
    />
  );
}
