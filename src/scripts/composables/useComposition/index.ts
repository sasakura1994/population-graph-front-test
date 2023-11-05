import { Api, type Composition, type Prefecture } from '@/scripts/Api';
import { computed, ref, watch } from 'vue';

export const useComposition = () => {
  const api = new Api();

  const prefectures = ref<Prefecture[]>([]);

  const checked = ref<{ [prefCode: number]: boolean }>({});

  watch(
    checked,
    () => {
      const noCompositionPrefCodes = checkedArray.value.filter(
        (prefCode) => compositions.value[prefCode] === undefined,
      );
      noCompositionPrefCodes.forEach((prefCode) => {
        void api.getComposition(prefCode).then((composition) => {
          compositions.value[prefCode] = composition;
        });
      });
    },
    { deep: true },
  );

  const checkedArray = computed(() => {
    return Object.entries(checked.value)
      .filter(([, v]) => v)
      .map(([k]) => +k);
  });

  const compositions = ref<{ [prefCode: number]: Composition }>({});

  const compositionAndNames = computed(
    (): Array<{ prefName: string; composition: Composition }> => {
      const checkedPrefectures = checkedArray.value
        .map((prefCode) => prefectures.value.find((p) => +p.prefCode === +prefCode))
        .filter((p): p is Prefecture => p !== undefined);

      return checkedPrefectures.map(({ prefName, prefCode }) => ({
        prefName,
        composition: compositions.value[prefCode] ?? {
          総人口: [],
          年少人口: [],
          生産年齢人口: [],
          老年人口: [],
        },
      }));
    },
  );

  return {
    async fetchPrefectures() {
      prefectures.value = await api.getPrefectures();
    },
    compositions: compositionAndNames,
    prefectures,
    checkedPrefectures: checked,
  };
};
