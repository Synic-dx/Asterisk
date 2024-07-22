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
  forgotOTP: string;
}

export default function VerificationEmail({
  userName,
  forgotOTP,
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
      <Preview>Here's your Password Reset code: {forgotOTP}</Preview>
      <Section style={{ padding: "20px" }}>
        <Row>
          <Img
            src="https://raw.githubusercontent.com/Synic-dx/Asterisk/5671045bb25be92a0bb48c8d7c09674a44ad699c/public/Images/Header.svg"
            alt="Asterisk Logo"
            width="150"
            height="50"
            style={{ marginBottom: "20px" }}
          />
        </Row>
        <Row>
          <Heading as="h1" style={{ color: "#27114D", fontFamily: "Karla, Roboto, Verdana, sans-serif" }}>
            Hello {userName},
          </Heading>
        </Row>
        <Row>
          <Text style={{ color: "#130529", fontFamily: "Karla, sans-serif", fontSize: "22px" }}>
            Here's your Password Reset Code:
          </Text>
        </Row>
        <Row>
          <Text style={{ color: "#130529", fontSize: "20px", fontWeight: "bold" }}>
            {forgotOTP}
          </Text>
        </Row>
        <Row>
          <Text style={{ color: "#130529", fontFamily: "Karla, sans-serif", fontSize: "22px" }}>
            If you did not request this code, please ignore this email.
          </Text>
        </Row>
        <Row>
          <Button
            href="https://yourwebsite.com/reset-password"
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
