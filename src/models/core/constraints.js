const { unique } = require("drizzle-orm/pg-core");

function fkTo(table, opts = {}) {
  return (col) =>
    col.references(() => table.id, {
      onDelete: opts.onDelete || "set null",
      onUpdate: opts.onUpdate || "cascade",
    });
}

function uniqueCombo(...colNames) {
  return (table) => {
    const cols = colNames.map((name) => {
      if (!(name in table)) {
        throw new Error(`uniqueCombo: column "${name}" not found in table`);
      }
      return table[name];
    });

    return unique().on(...cols);
  };
}

module.exports = { fkTo, uniqueCombo };