import type { IsCodeLiteral } from './code-literal.type';
import type { DomainComponentCode } from '@/codes';

/**
 * {Context}:{Component}:{Type}:{Action} 형태의 유닛 코드 타입을 정의합니다.
 */
export type UnitCode<
  T extends string,
  TComponent extends string,
  TAction extends string = string,
  TContext extends DomainComponentCode = DomainComponentCode,
> = T extends `${TContext}:${TComponent}:${infer Action}`
  ? IsCodeLiteral<Action, 1> extends true
    ? Action extends TAction
      ? T
      : never // ✅
    : never // ❌ 케이스가 틀림
  : `${TContext}:${TComponent}:${TAction}`;

/**
 * 메시지 코드의 구조와 케이스(Snake Case)를 검증합니다.
 * @template T - 입력된 코드 문자열
 * @template TComponent - 메시지 타입 ('cmd' | 'evt' | 'qry')
 */
export type ValidateUnitCode<
  T extends string,
  TComponent extends string,
  TAction extends string = string,
  TContext extends DomainComponentCode = DomainComponentCode,
> = T extends `${TContext}:${TComponent}:${infer Action}`
  ? IsCodeLiteral<Action, 1> extends true
    ? Action extends TAction
      ? T // ✅
      : ` [ Error: Action '${Action}' extends '${TAction}' ] `
    : `[ Error: Action '${Action}' must be lower_snake_case ]` // ❌ 케이스가 틀림
  : `${TContext}:${TComponent}:`;
