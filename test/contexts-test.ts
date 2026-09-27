import * as assert from "node:assert";
import type { TxtParagraphNode } from "@textlint/ast-node-types";
import { split, splitAST, type TxtSentenceNode } from "../src/sentence-splitter.js";

describe("sentence contexts", () => {
    it("only attaches closed pair marks to their own sentence, including the final sentence", () => {
        const sentences = split("「あ」。次。『う』").filter(
            (node): node is TxtSentenceNode => node.type === "Sentence"
        );
        assert.deepStrictEqual(
            sentences.map((node) => node.raw),
            ["「あ」。", "次。", "『う』"]
        );
        assert.deepStrictEqual(
            sentences.map((node) => node.contexts.map((context) => context.range)),
            [[[0, 2]], [], [[6, 8]]]
        );
    });

    it("keeps nested and multiline pairs sorted without splitting inside them", () => {
        const sentences = split("「あ『い。』\nう」。次。").filter(
            (node): node is TxtSentenceNode => node.type === "Sentence"
        );
        assert.deepStrictEqual(
            sentences.map((node) => node.raw),
            ["「あ『い。』\nう」。", "次。"]
        );
        assert.deepStrictEqual(
            sentences[0].contexts.map((context) => context.range),
            [
                [0, 8],
                [2, 5]
            ]
        );
        assert.deepStrictEqual(sentences[0].contexts[0].loc, {
            start: { line: 1, column: 0 },
            end: { line: 2, column: 1 }
        });
        assert.deepStrictEqual(sentences[1].contexts, []);
    });

    it("preserves an unclosed pair through end of input", () => {
        const sentences = split("「あ。次。");
        assert.strictEqual(sentences.length, 1);
        assert.strictEqual(sentences[0].raw, "「あ。次。");
        assert.deepStrictEqual((sentences[0] as TxtSentenceNode).contexts, []);
    });

    for (const count of [400, 800]) {
        it(`stores ${count} contexts for ${count} quoted sentences`, () => {
            const sentences = split("「あ」。\n".repeat(count)).filter(
                (node): node is TxtSentenceNode => node.type === "Sentence"
            );
            assert.strictEqual(sentences.length, count);
            assert.strictEqual(
                sentences.reduce((total, node) => total + node.contexts.length, 0),
                count
            );
            for (const sentence of sentences) {
                assert.strictEqual(sentence.contexts.length, 1);
                assert.deepStrictEqual(sentence.contexts[0].range, [sentence.range[0], sentence.range[0] + 2]);
            }
        });
    }

    it("also scopes splitAST contexts to each sentence with a nonzero source offset", () => {
        const raw = "「あ」。次。";
        const range = [11, 17] as const;
        const loc = { start: { line: 2, column: 0 }, end: { line: 2, column: 6 } };
        const paragraph: TxtParagraphNode = {
            type: "Paragraph",
            raw,
            range,
            loc,
            children: [{ type: "Str", raw, value: raw, range, loc }]
        };
        const sentences = splitAST(paragraph).children as TxtSentenceNode[];
        assert.deepStrictEqual(
            sentences.map((node) => node.raw),
            ["「あ」。", "次。"]
        );
        assert.deepStrictEqual(
            sentences.map((node) => node.range),
            [
                [11, 15],
                [15, 17]
            ]
        );
        assert.deepStrictEqual(
            sentences.map((node) => node.contexts.map((context) => context.range)),
            [[[11, 13]], []]
        );
    });
});
