import { createFakePerson } from "./fakePerson.factory";

export const main = () => {
  const DEFAULT_COUNT = 10;
  const count = parseInt(process.argv[2], 10) || DEFAULT_COUNT;

  const persons = [];
  for (let i = 0; i < count; i++) {
    persons.push(createFakePerson());
  }
  const keys = Object.keys(persons[0]);

  const headerRow = keys.join(",");
  const dataRows = persons.map((person) => {
    return keys.map((key) => person[key]);
  });

  const csvString = [headerRow, ...dataRows.map((row) => row.join(","))].join("\n");
  process.stdout.write(csvString);
  console.log("hello");
};

main();
