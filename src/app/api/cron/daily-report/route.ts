import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import sgMail from '@sendgrid/mail';
import * as xlsx from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Verify cron secret if provided
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    // 2. Determine date range for "yesterday"
    const now = new Date();
    const yesterdayStart = new Date(now);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(now);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // 3. Fetch sales
    const sales = await prisma.sale.findMany({
      where: {
        date: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        }
      },
      orderBy: { date: 'asc' }
    });

    if (sales.length === 0) {
      return NextResponse.json({ message: 'No sales yesterday. Report skipped.' });
    }

    // 4. Generate Excel
    const wb = xlsx.utils.book_new();
    
    // Format data for Excel
    const formatData = (items: typeof sales) => items.map(s => ({
      'Date': new Date(s.date).toLocaleString(),
      'Item Name': s.itemName,
      'Amount': s.amount
    }));

    const customersSales = sales.filter(s => s.type === 'CUSTOMERS');
    const productsSales = sales.filter(s => s.type === 'PRODUCTS');

    const wsCustomers = xlsx.utils.json_to_sheet(formatData(customersSales));
    xlsx.utils.book_append_sheet(wb, wsCustomers, 'Customer Sales');

    const wsProducts = xlsx.utils.json_to_sheet(formatData(productsSales));
    xlsx.utils.book_append_sheet(wb, wsProducts, 'Product Sales');

    const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 5. Send email via SendGrid
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not defined');
    }
    if (!process.env.ADMIN_EMAIL) {
      throw new Error('ADMIN_EMAIL is not defined');
    }
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL is not defined');
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const reportDateStr = yesterdayStart.toLocaleDateString();
    
    const msg = {
      to: process.env.ADMIN_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: `Daily Sales Report - ${reportDateStr}`,
      text: `Please find attached the daily sales report for ${reportDateStr}.`,
      attachments: [
        {
          content: excelBuffer.toString('base64'),
          filename: `Sales_Report_${reportDateStr.replace(/\//g, '-')}.xlsx`,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          disposition: 'attachment',
        },
      ],
    };

    await sgMail.send(msg);

    return NextResponse.json({ message: 'Daily report sent successfully' });
  } catch (error: any) {
    console.error('Error generating daily report:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
