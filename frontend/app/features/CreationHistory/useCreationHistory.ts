import { dataClient } from '~/data';
import { useAsyncData } from '~/hooks/useAsyncData';
import { mergeHistoryItems } from './mergeHistoryItems';

/**
 * 3ツールの作成物をまとめて取得し、新しい順の1リストにして返す。
 *
 * 3本を1つのローディングにまとめている。マージ済みの1リストを出すので、
 * 届いたものから順に表示すると並び順が崩れて見えるため。
 *
 * 返り値は useAsyncData そのまま（data / error / isLoading / refetch）。
 */
export function useCreationHistory() {
  return useAsyncData(async (signal) => {
    const [selfPromotions, motivations, entrySheets] = await Promise.all([
      dataClient.selfPromotions.list(signal),
      dataClient.motivations.list(signal),
      dataClient.entrySheets.list(signal),
    ]);
    return mergeHistoryItems(selfPromotions, motivations, entrySheets);
  }, []);
}
