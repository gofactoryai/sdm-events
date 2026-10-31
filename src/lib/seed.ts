import type Database from "better-sqlite3";
import { stateTimezone } from "./constants";

// Demo data taken from the current Google Sheets so the app has something real-looking on first run.
// Delete data/app.db to reset.

type D = Record<string, string | number | null>;

const WEEK = (wk: string, sat: string, sun = "Closed") => ({
  hours_mon: wk, hours_tue: wk, hours_wed: wk, hours_thu: wk, hours_fri: wk, hours_sat: sat, hours_sun: sun,
});

export function seed(db: Database.Database) {
  const tx = db.transaction(() => {
    const clientId = db
      .prepare("INSERT INTO clients (name, brand_name, brand_color) VALUES (?, ?, ?)")
      .run("SDM", "SDM Events", "#1d4ed8").lastInsertRowid as number;

    const dealers: D[] = [
      {
        name: "Hi-Country Kia Mitsubishi", auto_brand: "Kia / Mitsubishi", street: "4004 East Main Street", city: "Farmington", state: "NM", zip: "87402",
        phone: "505-373-1014", website: "https://www.hicountrykia.com", new_inventory_url: "https://www.hicountrykia.com/new-inventory/index.htm",
        used_inventory_url: "https://www.hicountrykia.com/used-inventory/index.htm", finance_url: "https://www.hicountrykia.com/financing/index.htm",
        crm_lead_email: "matt.romero@hicountryautogroup.com, cory.deblasio@hicountryautogroup.com", xml_lead_email: "leads@hicountrykiamitsubishi.com",
        ask_for: "Cory or Matt", ...WEEK("8am-6pm", "9am-6pm"), ghl_done: 1, closebot_done: 1,
      },
      { name: "Hi-Country Chevrolet", auto_brand: "Chevrolet", street: "404 W Chaco St", city: "Aztec", state: "NM", zip: "87410", phone: "(505) 390-2052", website: "https://www.hicountrychevrolet.com", ghl_done: 1, closebot_done: 1 },
      { name: "Hi-Country Buick GMC", auto_brand: "Buick / GMC", street: "1700 San Juan Blvd", city: "Farmington", state: "NM", zip: "87401", phone: "505-373-1025", website: "https://www.truck-guys.com/", ghl_done: 1, closebot_done: 1 },
      {
        name: "Don Franklin Somerset Kia", auto_brand: "Kia", street: "138 Turner St", city: "Somerset", state: "KY", zip: "42503", phone: "877-280-1084",
        website: "https://www.donfranklinsomersetkia.com", new_inventory_url: "https://www.donfranklinsomersetkia.com/new-vehicles/",
        used_inventory_url: "https://www.donfranklinsomersetkia.com/used-vehicles/", ask_for: "Discount Dave", ...WEEK("8:30 am - 7pm", "8:30 am - 6pm"),
        ghl_done: 1, closebot_done: 1,
      },
      {
        name: "Randy Wise CDJR Clio", auto_brand: "Chrysler / Dodge / Jeep / Ram", street: "4239 W Vienna Rd", city: "Clio", state: "MI", zip: "48420",
        phone: "810-670-8689", hours_sat: "9 AM - 2 PM", ghl_done: 1, closebot_done: 1,
      },
      { name: "Hyundai of El Cajon", auto_brand: "Hyundai", city: "El Cajon", state: "CA", ghl_done: 1, closebot_done: 1 },
      { name: "Shottenkirk Ford of Jasper", auto_brand: "Ford", ghl_done: 1, closebot_done: 1 },
      { name: "Nissan of Madisonville", auto_brand: "Nissan", street: "1801 Lantaff Blvd", city: "Madisonville", state: "KY", zip: "42431", phone: "(877) 646-4379", website: "https://www.nissanofmadisonville.com", ghl_done: 1, closebot_done: 1 },
      { name: "Sota Chevrolet", auto_brand: "Chevrolet", street: "1600 Cannon Ln", city: "Northfield", state: "MN", zip: "55057", phone: "507-321-4380", website: "https://www.sotachevrolet.com/", ghl_done: 1, closebot_done: 1 },
      { name: "Newton Ford South", auto_brand: "Ford", street: "2811 Hwy 231 N", city: "Shelbyville", state: "TN", zip: "37160", phone: "931-299-4079", website: "https://www.newtonfordsouth.com/", ghl_done: 1, closebot_done: 1 },
      { name: "All Star Hyundai", auto_brand: "Hyundai", street: "3950 Century Ct", city: "Pittsburg", state: "CA", zip: "94565", phone: "855-823-4659", website: "https://www.allstarhyundai.net", ghl_done: 1, closebot_done: 1 },
      { name: "Team Kia of Bend", auto_brand: "Kia", street: "611 NE Purcell Blvd", city: "Bend", state: "OR", zip: "97701", phone: "541-508-5862", website: "https://goteamkia.com/", ask_for: "Ask for the event team", ...WEEK("9am-7pm", "9am-6pm"), ghl_done: 1, closebot_done: 1 },
      { name: "Peterson Toyota", auto_brand: "Toyota", ghl_done: 0, closebot_done: 0, setup_notes: "New dealership — needs GHL sub-account and CloseBot bot." },
    ];

    const ids: Record<string, number> = {};
    for (const d of dealers) {
      const row: D = { client_id: clientId, timezone: stateTimezone(d.state as string | null), ...d };
      const keys = Object.keys(row);
      ids[d.name as string] = db
        .prepare(`INSERT INTO dealerships (${keys.join(",")}) VALUES (${keys.map((k) => "@" + k).join(",")})`)
        .run(row).lastInsertRowid as number;
    }

    const DFSK_INCENTIVES = `As little as $0 down
Rates as low as 0% APR
You may qualify for No Payments for 90 Days
Payments as low as $299/month
Up to $4,000 over KBB for your trade
FREE TV with new kia purchase`;

    const events: D[] = [
      { number: "FB1765", dealer: "Randy Wise CDJR Clio", start_date: "2026-10-19", end_date: "2026-10-24", status: "Completed", budget: 3150, handled_by: "BDC", copy_status: "approved", ad_copy_url: "https://docs.google.com/document/d/EXAMPLE-randy-wise-oct/edit", images_url: "https://drive.google.com/drive/folders/EXAMPLE-randy-wise-oct" },
      { number: "FB1758", dealer: "Nissan of Madisonville", start_date: "2026-10-21", end_date: "2026-11-01", status: "Running", budget: 4900, handled_by: "BDC" },
      { number: "FB1765-2", dealer: "Randy Wise CDJR Clio", start_date: "2026-10-26", end_date: "2026-10-31", status: "Running", budget: 3150, handled_by: "BDC" },
      { number: "FB1762", dealer: "Don Franklin Somerset Kia", start_date: "2026-10-26", end_date: "2026-10-31", status: "Running", budget: 4900, handled_by: "BDC", retargeting_url: "https://docs.google.com/spreadsheets/d/EXAMPLE-don-franklin-kia/edit", incentives: DFSK_INCENTIVES, internal_notes: "Hook Set (D) Free TV with new car" },
      { number: "FB1780", dealer: "All Star Hyundai", start_date: "2026-10-26", end_date: "2026-10-31", status: "Running", budget: 3900, handled_by: "BDC + CloseBot", internal_notes: "Hook Set (D)" },
      { number: "RT1001", dealer: "Newton Ford South", start_date: "2026-10-26", end_date: "2026-10-31", status: "Running", event_type: "Retargeting Only", handled_by: "CloseBot", retargeting_url: "https://docs.google.com/spreadsheets/d/EXAMPLE-newton-ford/edit" },
      { number: "RT1002", dealer: "Sota Chevrolet", start_date: "2026-10-26", end_date: "2026-10-31", status: "Running", event_type: "Retargeting Only", handled_by: "BDC" },
      { number: "RT1003", dealer: "Hyundai of El Cajon", start_date: "2026-10-26", end_date: "2026-10-31", status: "Paused", event_type: "Retargeting Only", handled_by: "BDC" },
      { number: "FB1779", dealer: "Shottenkirk Ford of Jasper", start_date: "2026-11-02", end_date: "2026-11-07", status: "Ad Copy Needed" },
      { number: "FB1781", dealer: "Hyundai of El Cajon", start_date: "2026-11-02", end_date: "2026-11-07", status: "Ad Copy Needed", client_notes: "They are having a $2,000 cash giveaway each Saturday at 4pm. Must take test drive to enter and be present to win." },
      { number: "FB1782", dealer: "Hi-Country Kia Mitsubishi", start_date: "2026-11-02", end_date: "2026-11-07", status: "Ad Copy Needed", client_notes: "November Ad Campaign" },
      { number: "FB1783", dealer: "Hi-Country Chevrolet", start_date: "2026-11-02", end_date: "2026-11-07", status: "Ad Copy Needed" },
      { number: "FB1784", dealer: "Hi-Country Buick GMC", start_date: "2026-11-09", end_date: "2026-11-14", status: "New Order" },
      { number: "FB1779-2", dealer: "Shottenkirk Ford of Jasper", start_date: "2026-11-16", end_date: "2026-11-21", status: "New Order" },
      { number: "FB1781-2", dealer: "Hyundai of El Cajon", start_date: "2026-11-16", end_date: "2026-11-21", status: "New Order", client_notes: "They are having a $2,000 cash giveaway each Saturday at 4pm. Must take test drive to enter and be present to win." },
      { number: "FB1785", dealer: "Peterson Toyota", start_date: "2026-11-23", end_date: "2026-11-28", status: "Dealer Setup Needed" },
    ];

    const evIds: Record<string, number> = {};
    for (const { dealer, ...e } of events) {
      const row: D = { dealership_id: ids[dealer as string], ...e };
      const keys = Object.keys(row);
      evIds[e.number as string] = db
        .prepare(`INSERT INTO events (${keys.join(",")}) VALUES (${keys.map((k) => "@" + k).join(",")})`)
        .run(row).lastInsertRowid as number;
    }

    const rw = evIds["FB1765"];
    db.prepare("UPDATE events SET share_token = ? WHERE id = ?").run("demo-randy-wise", rw);
  });
  tx();
}
