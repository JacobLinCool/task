import { Task } from "../src/task";

test("success", async () => {
	const task = example();
	const start = Date.now();

	expect(task.completed).toBe(false);
	expect(task.complete).toBeInstanceOf(Promise);
	expect(task.promise).toBeInstanceOf(Promise);

	const updater = ({ elapsed }: { elapsed: number }) => {
		const diff = Math.abs(Date.now() - start - elapsed);
		expect(diff).toBeLessThan(10);
	};
	task.on("update", updater);

	task.once("complete", (success, result) => {
		expect(success).toBe(true);
		expect(result).toBe(300);
	});

	await expect(task.complete).resolves.toBe(true);
	expect(task.completed).toBe(true);
	await expect(task.promise).resolves.toBe(300);

	task.off("update", updater);
});

test("failure", async () => {
	const task = new Task(
		(async () => {
			await new Promise((r) => setTimeout(r, 300));
			throw new Error("test");
		})(),
	);

	task.once("complete", (success, result) => {
		expect(success).toBe(false);
		expect(result).toBeInstanceOf(Error);
	});

	await expect(task.complete).resolves.toBe(false);
	expect(task.completed).toBe(true);
	await expect(task.promise).resolves.toBe(undefined);
});

test("function trans", async () => {
	const task = new Task(
		(async () => {
			await new Promise((r) => setTimeout(r, 100));
			return 10;
		})(),
		{ progress: 0 },
	);

	for (let i = 0; i < 10; i++) {
		await new Promise((r) => setTimeout(r, 10));
		task.update((state) => {
			expect(state.progress).toBe(i);
			return { progress: i + 1 };
		});
	}

	await expect(task.complete).resolves.toBe(true);
	expect(task.state.progress).toBe(10);
});

function example(): Task<number, { elapsed: number }> {
	const start = Date.now();
	const p = new Promise<number>((r) => setTimeout(() => r(300), 300));
	const t = new Task(p, { elapsed: 0 });

	(async () => {
		while (t.completed === false) {
			await new Promise((r) => setTimeout(r, 30));
			t.update({ elapsed: Date.now() - start });
		}
	})();

	return t;
}
