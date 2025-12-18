import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, generateBreachEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanId, breachType, details } = body;

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        organization: {
          include: {
            users: {
              where: {
                role: {
                  in: ["ADMIN", "CREDIT_OFFICER"],
                },
              },
            },
          },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Create notification records
    const notifications = await Promise.all(
      loan.organization?.users.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            loanId: loan.id,
            type: "BREACH",
            title: `Covenant Breach: ${loan.borrowerName}`,
            message: details,
          },
        })
      ) || []
    );

    // Send emails to all admins and credit officers
    const emailPromises = loan.organization?.users.map(async (user) => {
      if (user.email) {
        const emailContent = generateBreachEmail(
          loan.borrowerName,
          breachType,
          details
        );
        const result = await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });

        // Update notification if email was sent
        if (result.success) {
          await prisma.notification.updateMany({
            where: { userId: user.id, loanId: loan.id, type: "BREACH" },
            data: { emailSent: true },
          });
        }
      }
    }) || [];

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      notificationsCreated: notifications.length,
    });
  } catch (error) {
    console.error("Error creating breach notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

