import _package from "../package.json";
import { pkg } from "../src/pkg";

test("version", () => {
	expect(pkg.version).toBe(_package.version);
});
