import EventEmitter from "eventemitter3";

export type State = void | null | boolean | number | string | undefined | object;

export class Task<ResultState extends State, UpdateState extends State> extends EventEmitter {
	public completed: boolean;
	public complete: Promise<boolean>;
	public promise: Promise<ResultState | void>;
	public state: UpdateState;
	public result?: ResultState;

	constructor(promise: Promise<ResultState>, state?: UpdateState) {
		super();
		this.promise = promise;
		this.completed = false;
		this.complete = new Promise((resolve) => {
			this.promise = promise
				.finally(() => {
					this.completed = true;
				})
				.then((x) => {
					this.result = x;
					resolve(true);
					this.emit("complete", true, x);
					return x;
				})
				.catch((x) => {
					resolve(false);
					this.emit("complete", false, x);
				});
		});
		this.state = state ?? (null as UpdateState);
	}

	public async update(
		trans:
			| ((state: UpdateState) => UpdateState | Promise<UpdateState>)
			| UpdateState
			| Promise<UpdateState>,
	): Promise<void> {
		if (typeof trans === "function") {
			this.state = await trans(this.state);
		} else {
			this.state = await trans;
		}
		this.emit("update", this.state);
	}

	public on(event: "update", listener: (state: UpdateState) => void): this;
	public on(
		event: "complete",
		listener: <T extends boolean>(
			success: T,
			result: T extends true ? ResultState : any,
		) => void,
	): this;
	public on(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}

	public once(event: "update", listener: (state: UpdateState) => void): this;
	public once(
		event: "complete",
		listener: <T extends boolean>(
			success: T,
			result: T extends true ? ResultState : any,
		) => void,
	): this;
	public once(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.once(event, listener);
	}

	public off(event: "update", listener: (state: UpdateState) => void): this;
	public off(
		event: "complete",
		listener: <T extends boolean>(
			success: T,
			result: T extends true ? ResultState : any,
		) => void,
	): this;
	public off(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.off(event, listener);
	}
}
