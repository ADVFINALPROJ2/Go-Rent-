import { fetchAvailableCars } from "../src/lib/cars/queries";
import { db } from "../src/db/client";
import { cars } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function runVerification() {
  console.log("=== STARTING VERIFICATION OF CAR FILTERING SYSTEM ===");

  // 1. Get all available cars first
  const allCars = await fetchAvailableCars({});
  console.log(`Total available cars in DB: ${allCars.length}`);
  
  if (allCars.length === 0) {
    throw new Error("No cars returned from fetchAvailableCars!");
  }

  // 2. Test Search Make/Model
  console.log("\nTesting search filter...");
  const searchBYD = await fetchAvailableCars({ search: "BYD" });
  console.log(`Search 'BYD' returned ${searchBYD.length} cars`);
  if (searchBYD.length !== 1 || searchBYD[0].make !== "BYD") {
    throw new Error("Search filter failed to match BYD correctly.");
  }

  const searchModel = await fetchAvailableCars({ search: "atto" });
  console.log(`Search 'atto' returned ${searchModel.length} cars`);
  if (searchModel.length !== 1 || searchModel[0].model !== "Atto 3") {
    throw new Error("Search filter failed to match Atto 3 model correctly.");
  }

  // 3. Test Location (Addis Area) filter
  console.log("\nTesting Area filter...");
  const boleCars = await fetchAvailableCars({ location: "Bole" });
  console.log(`Area 'Bole' returned ${boleCars.length} cars`);
  const allInBole = boleCars.every(c => c.location === "Bole");
  if (!allInBole || boleCars.length === 0) {
    throw new Error("Location filter failed to restrict results to Bole.");
  }

  // 4. Test Category filter
  console.log("\nTesting Category filter...");
  const suvCars = await fetchAvailableCars({ category: "SUV" });
  console.log(`Category 'SUV' returned ${suvCars.length} cars`);
  const allSUVs = suvCars.every(c => c.category === "SUV");
  if (!allSUVs || suvCars.length === 0) {
    throw new Error("Category filter failed to restrict results to SUV.");
  }

  // 5. Test Price filter
  console.log("\nTesting Price filter...");
  const priceFiltered = await fetchAvailableCars({ minPrice: 2000, maxPrice: 4000 });
  console.log(`Price range 2000 - 4000 returned ${priceFiltered.length} cars`);
  const validPrices = priceFiltered.every(c => c.daily_rate >= 2000 && c.daily_rate <= 4000);
  if (!validPrices || priceFiltered.length === 0) {
    throw new Error("Price range filter failed.");
  }

  // 6. Test Transmission filter
  console.log("\nTesting Transmission filter...");
  const autoCars = await fetchAvailableCars({ transmission: "Automatic" });
  console.log(`Transmission 'Automatic' returned ${autoCars.length} cars`);
  const allAuto = autoCars.every(c => c.transmission === "Automatic");
  if (!allAuto || autoCars.length === 0) {
    throw new Error("Transmission filter failed.");
  }

  // 7. Test Fuel filter
  console.log("\nTesting Fuel filter...");
  const electricCars = await fetchAvailableCars({ fuelType: "Electric" });
  console.log(`Fuel 'Electric' returned ${electricCars.length} cars`);
  const allElectric = electricCars.every(c => c.fuel_type === "Electric");
  if (!allElectric || electricCars.length === 0) {
    throw new Error("Fuel filter failed.");
  }

  // 8. Test Min Seats filter
  console.log("\nTesting Min Seats filter...");
  const minSeatsCars = await fetchAvailableCars({ minSeats: 5 });
  console.log(`Min seats 5 returned ${minSeatsCars.length} cars`);
  const allMin5Seats = minSeatsCars.every(c => (c.seats ?? 0) >= 5);
  if (!allMin5Seats || minSeatsCars.length === 0) {
    throw new Error("Min seats filter failed.");
  }

  console.log("\n=== TEST OWNER WORKFLOW ===");
  // Note: We need a valid owner session / requireUser to test create/update car actions.
  // Because they call requireUser(), let's check if we can mock the session or just test the DB insert/update directly.
  // Since requireUser() reads cookies / session, calling createCar directly from terminal without a session cookie will throw an error.
  // Let's verify that requireUser session check is intact, and verify query mapping/database insertion.
  console.log("Mocking DB insert for owner creation flow...");
  
  const testCarId = "temp-verify-car-id";
  // Clean up any stale verify car first
  db.delete(cars).where(eq(cars.id, testCarId)).run();

  // Insert a car that matches user's request: Bole + SUV + Automatic + Petrol
  db.insert(cars).values({
    id: testCarId,
    ownerId: "owner-user",
    title: "Verify Test SUV Bole Automatic Petrol",
    make: "Ford",
    model: "Explorer",
    year: 2022,
    category: "SUV",
    mileage: 15000,
    dailyRate: 3500,
    location: "Bole",
    description: "Verification test car for Bole + SUV + Automatic + Petrol.",
    status: "available",
    seats: 7,
    transmission: "Automatic",
    fuelType: "Petrol",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).run();

  console.log("Successfully inserted verification car directly into SQLite database.");

  // Check if it appears in Browse when those filters are selected
  const matchingBrowse = await fetchAvailableCars({
    location: "Bole",
    category: "SUV",
    transmission: "Automatic",
    fuelType: "Petrol"
  });

  console.log(`Browse search for (Bole, SUV, Automatic, Petrol) returned ${matchingBrowse.length} results.`);
  const found = matchingBrowse.some(c => c.id === testCarId);
  if (!found) {
    throw new Error("Verification car was not found in filtered search results!");
  }
  console.log("Verification car found in browse results! Filter matching is correct.");

  // Edit the car to another area/category
  console.log("Updating verification car to CMC + Sedan...");
  db.update(cars).set({
    location: "CMC",
    category: "Sedan",
    updatedAt: new Date().toISOString()
  }).where(eq(cars.id, testCarId)).run();

  // Check if it doesn't appear under old filters, but does under new filters
  const matchingOldFilters = await fetchAvailableCars({
    location: "Bole",
    category: "SUV",
  });
  const foundInOld = matchingOldFilters.some(c => c.id === testCarId);
  if (foundInOld) {
    throw new Error("Verification car still appeared under old location/category filters after update!");
  }
  console.log("Verification car no longer appears under old filters. Correct.");

  const matchingNewFilters = await fetchAvailableCars({
    location: "CMC",
    category: "Sedan",
  });
  const foundInNew = matchingNewFilters.some(c => c.id === testCarId);
  if (!foundInNew) {
    throw new Error("Verification car was not found under new CMC + Sedan filters after update!");
  }
  console.log("Verification car found under new CMC + Sedan filters! Update logic verified.");

  // Clean up
  db.delete(cars).where(eq(cars.id, testCarId)).run();
  console.log("Cleaned up verification test car.");

  console.log("\n=== ALL Programmatic Filter Verifications Passed Successfully! ===");
}

runVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
