import slugifyLib from 'slugify';

export const slugify = (text: string): string => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
    replacement: '-',
  });
};

/**
 * Generate a unique slug by appending a counter if the base slug is taken.
 * Pass a checkExists function that resolves true if the slug is already used.
 */
export const generateUniqueSlug = async (
  text: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> => {
  const baseSlug = slugify(text);
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
