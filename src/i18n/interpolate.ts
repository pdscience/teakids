export type InterpolationParams = Record<string, string | number>;

export function interpolate(template: string, params?: InterpolationParams): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}
