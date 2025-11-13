import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function GET() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent("<h1>Hello, PDF!</h1>");
  const pdfBuffer = await page.pdf({ format: "A4" });
  const buffer = Buffer.from(pdfBuffer);

  await browser.close();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="document.pdf"',
    },
  });
}
