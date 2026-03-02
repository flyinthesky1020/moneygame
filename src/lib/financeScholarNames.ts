const SURNAMES = [
  "陈", "林", "赵", "周", "吴", "郑", "王", "李", "孙", "钱",
  "徐", "冯", "何", "吕", "施", "张", "刘", "曹", "严", "华",
  "金", "魏", "陶", "姜", "谢", "曾", 
] as const;

const GIVEN_NAMES = [
  "启衡", "惟中", "鱼鱼", "维钧", "伯言", "述尧", "沛然", "知远", "谨行", "怀瑾",
  "明谦", "景曜", "允执", "绍文", "砺行", "望舒", "希尧", "知衡", "敬亭", "闻道",
  "致远", "景行", "怀朴", "允和", "知白", "砚秋", "昌昌", "明澈", "修竹", "慎思",
  "伯庸", "叙白", "景铎", "怀仁", "知新", "若谷", "言川", "惟安", "承宇", "钰钰",
] as const;

export const FINANCE_SCHOLAR_NAMES = SURNAMES.flatMap((surname) =>
  GIVEN_NAMES.map((givenName) => `${surname}${givenName}`)
);

export function hashSeed(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickScholarNames(dateKey: string, count: number) {
  const total = FINANCE_SCHOLAR_NAMES.length;
  const start = hashSeed(dateKey) % total;
  return Array.from({ length: Math.min(count, total) }, (_, index) => {
    return FINANCE_SCHOLAR_NAMES[(start + index) % total];
  });
}
