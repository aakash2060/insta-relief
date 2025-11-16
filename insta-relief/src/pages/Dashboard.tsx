import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Chip,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, getDocs, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";

// COMPONENTS
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
  policyId: string;
  balance: number;
  status: string;
  isActivated: boolean;
  walletAddress?: string;
}

interface Transaction {
  id: string;
  type: string;
  location: string;
  amount: number;
  amountSOL?: number;
  createdAt: string;
  status: string;
  signature?: string;
  explorerUrl?: string;
  exchangeRate?: number;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  const fetchTransactions = async (userZip: string) => {
    try {
      const ref = collection(db, "catastrophes");
      const q = query(ref, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const list: Transaction[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.zipCodes?.includes(userZip)) {
          const result = d.payoutResults?.find(
            (r: any) => r.email === auth.currentUser?.email
          );

          list.push({
            id: doc.id,
            type: d.type,
            location: d.location,
            amount: d.amount,
            amountSOL: d.amountSOL,
            exchangeRate: d.exchangeRate,
            createdAt: d.createdAt,
            status: result?.success ? "Completed" : "Failed",
            signature: result?.signature,
            explorerUrl: result?.explorerUrl,
          });
        }
      });

      setTransactions(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as UserData;
          setUserData(data);
          await fetchTransactions(data.zip);
        }
      } catch (e) {
        console.error(e);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) {
    return (
      <Container
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!userData) return null;

  const isActive = userData.status === "ACTIVE";

  return (
    <>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack spacing={4}>

          {/* HEADER CARD */}
          <Card
            sx={{
              p: 4,
              borderRadius: 4,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #0f172a, #1e293b)"
                  : "#F8FAFC",
              boxShadow: "0px 12px 35px rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: 0.5,
                    background: "linear-gradient(90deg, #60A5FA, #A78BFA)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Policy Dashboard
                </Typography>

                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    color: "#93C5FD",
                    borderColor: "#93C5FD",
                    px: 2.5,
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#A5B4FC",
                      color: "#A5B4FC",
                    },
                  }}
                >
                  Logout
                </Button>
              </Stack>

              {/* USER INFO */}
              <Stack spacing={1.2} alignItems="center" sx={{ mt: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {userData.firstName} {userData.lastName}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {userData.email}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  ZIP Code: {userData.zip}
                </Typography>

                {userData.walletAddress && (
                  <Typography variant="body2" color="text.secondary">
                    Wallet: {userData.walletAddress.slice(0, 8)}...
                    {userData.walletAddress.slice(-8)}
                  </Typography>
                )}
              </Stack>

              {/* STATUS + BALANCE */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: isActive
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(245,158,11,0.12)",
                  textAlign: "center",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: isActive ? "success.main" : "warning.main",
                    mb: 1,
                  }}
                >
                  Status: {userData.status}
                </Typography>

                <Typography variant="body1">
                  Policy ID:&nbsp;
                  <strong style={{ color: "#60A5FA" }}>
                    {userData.policyId}
                  </strong>
                </Typography>

                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  Emergency Fund Balance:&nbsp;
                  <strong style={{ color: "#10B981", fontSize: "1.2rem" }}>
                    ${userData.balance.toFixed(2)}
                  </strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* TRANSACTION HISTORY */}
          <Card
            sx={{
              borderRadius: 4,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(145deg, #111827, #1f2937)"
                  : "#FFFFFF",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Transaction History
              </Typography>

              {transactions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No transactions yet. You’ll see payouts here when catastrophes affect your area.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Event Type</strong></TableCell>
                        <TableCell><strong>Location</strong></TableCell>
                        <TableCell><strong>Amount (USD)</strong></TableCell>
                        <TableCell><strong>Amount (SOL)</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Blockchain</strong></TableCell>
                        <TableCell><strong>Exchange Rate</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{tx.type}</TableCell>
                          <TableCell>{tx.location}</TableCell>
                          <TableCell>${tx.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {tx.amountSOL ? tx.amountSOL.toFixed(4) : "0.0000"} SOL
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tx.status}
                              color={tx.status === "Completed" ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {tx.explorerUrl ? (
                              <Link
                                href={tx.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontSize: "0.875rem" }}
                              >
                                View on Explorer
                              </Link>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {tx.exchangeRate ? `$${tx.exchangeRate.toFixed(2)}/SOL` : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

        </Stack>
      </Container>

      <Footer />
    </>
  );
}
