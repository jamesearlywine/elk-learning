import { main } from "./fakePerson";

describe("fakePerson.ts", () => {
  describe("main", () => {
    it("should do stuff", () => {
      const processStdoutWriteSpy = jest.spyOn(process.stdout, "write");
      main();
      expect(processStdoutWriteSpy).toHaveBeenCalled();
    });
  });
});
