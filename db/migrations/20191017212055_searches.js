exports.up = function(knex) {
  return knex.schema.createTable("searches", tbl => {
    tbl.increments("id");
    tbl.string("player_name").notNullable();
    tbl.integer("user_id").notNullable();
    tbl.foreign("user_id").references("users.id");
    tbl.string("data");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("searches");
};
