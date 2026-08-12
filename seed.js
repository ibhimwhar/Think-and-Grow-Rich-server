require("dotenv").config();

const { supabase } = require("./config/supabase.js");
const { Chapters } = require("./data.js");

async function seedDatabase() {
  console.log("Starting database seed...");

  console.log(`Chapters loaded: ${Chapters.length}`);

  const { data, error } = await supabase
    .from("chapters")
    .insert(Chapters)
    .select();

  if (error) {
    console.error("Failed to seed database:");
    console.error(error);
    return;
  }

  console.log(`Successfully inserted ${data.length} chapters.`);
}

seedDatabase();