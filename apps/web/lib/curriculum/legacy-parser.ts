import ts from "typescript";

export type LegacyContentBlock = {
  type: string;
  text?: string;
  title?: string;
  author?: string;
  items?: string[];
  [key: string]: unknown;
};

export type LegacyQuestion = {
  q: string;
  options: string[];
  correct: number;
};

export type LegacyLesson = {
  title: string;
  content: LegacyContentBlock[];
};

export type LegacyModule = {
  id: number;
  free?: boolean;
  title: string;
  subtitle: string;
  icon: string;
  tag: string;
  duration: string;
  xpReward: number;
  lessons: LegacyLesson[];
  quiz: LegacyQuestion[];
};

function propertyName(node: ts.PropertyName): string {
  if (
    ts.isIdentifier(node)
    || ts.isStringLiteral(node)
    || ts.isNumericLiteral(node)
  ) {
    return node.text;
  }
  throw new Error(`Unsupported legacy property name: ${node.getText()}`);
}

function evaluateNode(
  node: ts.Expression,
  values: Map<string, unknown>,
): unknown {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isIdentifier(node)) {
    if (!values.has(node.text)) {
      throw new Error(`Unknown legacy data identifier: ${node.text}`);
    }
    return values.get(node.text);
  }
  if (ts.isPrefixUnaryExpression(node)) {
    const operand = evaluateNode(node.operand, values);
    if (typeof operand !== "number") {
      throw new Error(`Unsupported unary operand: ${node.getText()}`);
    }
    if (node.operator === ts.SyntaxKind.MinusToken) return -operand;
    if (node.operator === ts.SyntaxKind.PlusToken) return operand;
  }
  if (
    ts.isParenthesizedExpression(node)
    || ts.isAsExpression(node)
    || ts.isTypeAssertionExpression(node)
    || ts.isSatisfiesExpression(node)
  ) {
    return evaluateNode(node.expression, values);
  }
  if (ts.isArrayLiteralExpression(node)) {
    const result: unknown[] = [];
    for (const element of node.elements) {
      if (ts.isSpreadElement(element)) {
        const spread = evaluateNode(element.expression, values);
        if (!Array.isArray(spread)) {
          throw new Error(`Legacy array spread is not an array: ${element.getText()}`);
        }
        result.push(...spread);
      } else {
        result.push(evaluateNode(element, values));
      }
    }
    return result;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const result: Record<string, unknown> = {};
    for (const property of node.properties) {
      if (ts.isPropertyAssignment(property)) {
        result[propertyName(property.name)] = evaluateNode(
          property.initializer,
          values,
        );
      } else if (ts.isShorthandPropertyAssignment(property)) {
        result[property.name.text] = evaluateNode(property.name, values);
      } else if (ts.isSpreadAssignment(property)) {
        const spread = evaluateNode(property.expression, values);
        if (!spread || typeof spread !== "object" || Array.isArray(spread)) {
          throw new Error(`Legacy object spread is not an object: ${property.getText()}`);
        }
        Object.assign(result, spread);
      } else {
        throw new Error(`Unsupported legacy object property: ${property.getText()}`);
      }
    }
    return result;
  }

  throw new Error(
    `Unsupported expression in legacy curriculum: ${ts.SyntaxKind[node.kind]} ${node.getText().slice(0, 100)}`,
  );
}

function validateModules(value: unknown): LegacyModule[] {
  if (!Array.isArray(value)) throw new Error("Legacy modules are not an array");

  return value.map((candidate, moduleIndex) => {
    const legacyModule = candidate as Partial<LegacyModule>;
    if (
      !legacyModule
      || typeof legacyModule !== "object"
      || !Number.isInteger(legacyModule.id)
      || typeof legacyModule.title !== "string"
      || typeof legacyModule.subtitle !== "string"
      || typeof legacyModule.xpReward !== "number"
      || !Array.isArray(legacyModule.lessons)
      || !Array.isArray(legacyModule.quiz)
    ) {
      throw new Error(`Invalid legacy module at index ${moduleIndex}`);
    }

    legacyModule.lessons.forEach((lesson, lessonIndex) => {
      if (
        !lesson
        || typeof lesson.title !== "string"
        || !Array.isArray(lesson.content)
      ) {
        throw new Error(
          `Invalid legacy lesson at module ${module.id}, index ${lessonIndex}`,
        );
      }
    });
    legacyModule.quiz.forEach((question, questionIndex) => {
      if (
        !question
        || typeof question.q !== "string"
        || !Array.isArray(question.options)
        || question.options.some((option) => typeof option !== "string")
        || !Number.isInteger(question.correct)
        || question.correct < 0
        || question.correct >= question.options.length
      ) {
        throw new Error(
          `Invalid legacy question at module ${module.id}, index ${questionIndex}`,
        );
      }
    });

    return legacyModule as LegacyModule;
  });
}

export function parseLegacyAcademy(source: string): LegacyModule[] {
  const sourceFile = ts.createSourceFile(
    "iron-vault-academy-unlocked.jsx",
    source,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.JSX,
  );
  const values = new Map<string, unknown>();
  const wanted = new Set([
    "FREE_MODULE_0",
    "NEW_SIX_MODULES",
    "ORIGINAL_SIX_MODULES",
  ]);

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name)
        || !wanted.has(declaration.name.text)
        || !declaration.initializer
      ) {
        continue;
      }
      values.set(
        declaration.name.text,
        evaluateNode(declaration.initializer, values),
      );
    }
  }

  const free = values.get("FREE_MODULE_0");
  const original = values.get("ORIGINAL_SIX_MODULES");
  const expanded = values.get("NEW_SIX_MODULES");
  if (!free || !Array.isArray(original) || !Array.isArray(expanded)) {
    throw new Error("Could not locate all legacy curriculum declarations");
  }

  const modules = validateModules([free, ...original, ...expanded]);
  const lessonCount = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );
  const questionCount = modules.reduce(
    (total, module) => total + module.quiz.length,
    0,
  );

  if (modules.length !== 13 || lessonCount !== 77 || questionCount !== 130) {
    throw new Error(
      `Legacy corpus drift: expected 13 modules / 77 lessons / 130 questions, received ${modules.length} / ${lessonCount} / ${questionCount}`,
    );
  }

  return modules;
}
