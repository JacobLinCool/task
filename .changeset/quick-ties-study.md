---
"@jacoblincool/task": major
---

First release, Task is a mix of eventemitter and promise for long-run jobs

There is a simple example in the README.md, which prints out the progress every second until the task is completed.

```ts
import { Task } from "@jacoblincool/task";

main();

async function main() {
    const proc = new Promise<string>((r) => setTimeout(() => r("done"), 10_000));

    const task = new Task(proc, { progress: 0 })
        .on("update", (state) => {
            console.log(state);
        })
        .on("complete", (success, result) => {
            console.log({ success, result });
        });

    (async () => {
        while (true) {
            await new Promise((r) => setTimeout(r, 1000));
            if (task.completed) {
                break;
            }
            task.update((state) => ({ progress: state.progress + 1 }));
        }
    })();

    await task.complete;
    console.log("All done!");
}
```

Output:

```ts
❯ tsx examples/example.ts
{ progress: 1 }
{ progress: 2 }
{ progress: 3 }
{ progress: 4 }
{ progress: 5 }
{ progress: 6 }
{ progress: 7 }
{ progress: 8 }
{ progress: 9 }
{ success: true, result: 'done' }
All done!
```
