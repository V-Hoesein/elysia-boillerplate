import { t } from 'elysia'
import type { TSchema } from 'elysia'

export function success<T>(data: T, message: string, meta: unknown = null) {
  return { success: true as const, message, data, meta }
}
export function successSchema<T extends TSchema>(
  data: T,
  meta: TSchema = t.Null(),
) {
  return t.Object({ success: t.Literal(true), message: t.String(), data, meta })
}
export const errorSchema = t.Object({
  success: t.Literal(false),
  message: t.String(),
  error: t.Object({ code: t.String(), details: t.Unknown() }),
})
