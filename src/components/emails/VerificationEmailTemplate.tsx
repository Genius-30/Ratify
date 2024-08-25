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
  Container,
  Img,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmailTemplate({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verify Your Email</title>
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
      <Preview>Your verification code for Ratify</Preview>
      <Container style={styles.container}>
        <Section style={styles.section}>
          <Row>
            <Img
              src="https://res.cloudinary.com/dgzee4v9w/image/upload/v1724136804/Ratify_Logo_hevvsg.png"
              alt="Ratify Logo"
              width="120"
              height="auto"
              style={styles.logo}
            />
          </Row>
          <Row>
            <Heading as="h2" style={styles.heading}>
              Welcome to Ratify, {username}!
            </Heading>
          </Row>
          <Row>
            <Text style={styles.text}>
              Thank you for joining our community! To complete your registration
              and start giving feedback to organizations, please use the
              verification code below:
            </Text>
          </Row>
          <Row>
            <Text style={styles.otp}>{otp}</Text>
          </Row>
          <Row>
            <Text style={styles.text}>
              If you didn’t request this, please ignore this email. No further
              action is required.
            </Text>
          </Row>
          <Row>
            <Button
              href={`http://localhost:3000/verify/${username}`}
              style={styles.button}
            >
              Verify Your Email
            </Button>
          </Row>
        </Section>
      </Container>
    </Html>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  section: {
    padding: "10px 0",
  },
  logo: {
    margin: "0 auto",
    display: "block",
  },
  heading: {
    fontSize: "24px",
    color: "#333",
  },
  text: {
    fontSize: "16px",
    color: "#555",
    margin: "10px 0",
  },
  otp: {
    fontSize: "32px",
    color: "#61dafb",
    fontWeight: "bold",
    textAlign: "center" as "center",
    margin: "20px 0",
  },
  button: {
    backgroundColor: "#61dafb",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "4px",
    textDecoration: "none",
    textAlign: "center" as "center",
    display: "block",
    margin: "20px auto",
  },
};
