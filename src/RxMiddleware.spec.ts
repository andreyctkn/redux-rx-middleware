import { Dispatch } from "redux";
import { Observable } from "rxjs";
import { ObservableAction, rxMiddleware, Sequence } from "./RxMiddleware";

describe("RxMiddleware", () => {
    let mockDispatch: jest.Mock;
    let dispatch: Dispatch<any>;

    beforeEach(() => {
        mockDispatch = jest.fn();
        dispatch = rxMiddleware()(mockDispatch);
    });

    it("should handle Flux standard actions", () => {
        const action: ObservableAction<number> = {
            type: "ACTION_TYPE",
            payload: Observable.from([1, 2, 3]),
        };
        dispatch(action);

        expect(mockDispatch.mock.calls).toEqual([
            [{ meta: { sequence: Sequence.Next }, payload: 1, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next }, payload: 2, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next }, payload: 3, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Complete }, type: "ACTION_TYPE" }],
        ]);
    });

    it("should not override additional action fields", () => {
        const action: ObservableAction<number> = {
            type: "ACTION_TYPE",
            payload: Observable.from([1, 2, 3]),
            meta: {
                test: "test",
            },
        };
        dispatch(action);

        expect(mockDispatch.mock.calls).toEqual([
            [{ meta: { sequence: Sequence.Next, test: "test" }, payload: 1, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next, test: "test" }, payload: 2, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next, test: "test" }, payload: 3, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Complete, test: "test" }, type: "ACTION_TYPE" }],
        ]);
    });

    it("should ignore non-observables", () => {
        dispatch({ type: "ACTION_TYPE" });
        expect(mockDispatch.mock.calls).toEqual([[{ type: "ACTION_TYPE" }]]);
    });
});