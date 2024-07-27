import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
  Img,
} from "@react-email/components";

interface VerificationEmailProps {
  userName: string;
  resetToken: string;
}

// Ensure NEXT_PUBLIC_BASE_URL is correctly imported from environment variables
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Fallback for local development

export default function VerificationEmail({
  userName,
  resetToken,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Asterisk | Password Reset Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here's your Password Reset code: {resetToken}</Preview>
      <Section style={{ padding: "20px" }}>
        <Row>
          <Heading as="h1" style={{ color: "#27114D", fontFamily: "Karla, Roboto, Verdana, sans-serif" }}>
            Welcome to Asterisk Academy, {userName}!
          </Heading>
        </Row>
        <Row>
          <Text style={{ color: "#130529", fontFamily: "Karla, sans-serif", fontSize: "22px" }}>
            Here's your Password Reset Code:
          </Text>
        </Row>
        <Row>
          <Text style={{ color: "#130529", fontSize: "20px", fontWeight: "bold" }}>
            {resetToken}
          </Text>
        </Row>
        <Row>
          <Text style={{ color: "#130529", fontFamily: "Karla, sans-serif", fontSize: "22px" }}>
            If you did not request this code, please ignore this email.
          </Text>
        </Row>
        <Row>
          <Button
            href={`${BASE_URL}/set-new-password?token=${resetToken}`} // Use the BASE_URL for the reset link
            style={{
              backgroundColor: "#27114D",
              color: "white",
              padding: "10px 20px",
              textAlign: "center",
              textDecoration: "none",
              display: "inline-block",
              fontSize: "16px",
              margin: "20px 0",
              cursor: "pointer",
              borderRadius: "6px",
            }}
          >
            Reset Password
          </Button>
        </Row>
      </Section>
    </Html>
  );
}
