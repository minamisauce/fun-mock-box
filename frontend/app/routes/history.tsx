import { PageHeader } from '~/components/PageHeader';
import { CreationHistoryList } from '~/features/CreationHistory/CreationHistoryList';
import { useCreationHistory } from '~/features/CreationHistory/useCreationHistory';

export function meta() {
  return [
    { title: '作成履歴 | fun-mock-box' },
    {
      name: 'description',
      content: '自己PR・志望動機・ES の作成履歴',
    },
  ];
}

export default function History() {
  const { data, error, isLoading, refetch } = useCreationHistory();

  return (
    <>
      {/* 下層ページなので帯にしない。色帯はホームだけに絞る */}
      <PageHeader title='作成履歴' />

      <div className='flex flex-col gap-xl px-md py-xl'>
        <CreationHistoryList
          items={data ?? []}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyMessage='まだ作成した文章はありません。ホームからツールを選んで作成してみましょう。'
        />
      </div>
    </>
  );
}
