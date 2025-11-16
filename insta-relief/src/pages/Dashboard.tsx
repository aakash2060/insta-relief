import { useEffect, useState } from "react";
import {
  Box,
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
  TablePagination,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  orderBy,
} from "firebase/firestore";

// layout
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// icons
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

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

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const fetchTransactions = async (userZip: string) => {
    try {
      const catastrophesRef = collection(db, "catastrophes");
      const q = query(catastrophesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const userTransactions: Transaction[] = [];
      querySnapshot.forEach((d) => {
        const data = d.data();
        if (data.zipCodes && data.zipCodes.includes(userZip)) {
          const payoutResult = data.payoutResults?.find(
            (r: any) => r.email === auth.currentUser?.email
          );

          userTransactions.push({
            id: d.id,
            type: data.type,
            location: data.location,
            amount: data.amount,
            amountSOL: data.amountSOL,
            exchangeRate: data.exchangeRate,
            createdAt: data.createdAt,
            status: payoutResult?.success ? "Completed" : "Failed",
            signature: payoutResult?.signature,
            explorerUrl: payoutResult?.explorerUrl,
          });
        }
      });

      setTransactions(userTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate("/");
        return;
      }

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
          await fetchTransactions(data.zip);
        } else {
          alert("User data not found.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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

  const isActive =
    userData.status === "ACTIVE" || userData.status === "PAID" || userData.status === "Paid";

  return (
    <>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack spacing={4}>
          {/* HERO POLICY CARD */}
          <Card
            sx={{
              borderRadius: 6,
              px: { xs: 3, md: 6 },
              py: { xs: 4, md: 5 },
              background:
                "radial-gradient(circle at top, #1f2937 0, #020617 55%)",
              boxShadow: "0 26px 60px rgba(0,0,0,0.75)",
              border: "1px solid rgba(15, 185, 129, 0.25)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Top Row */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 4 }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: 0.5,
                    color: "#E5E7EB",
                  }}
                >
                  Policy Dashboard
                </Typography>

                <Chip
                  icon={<ShieldOutlinedIcon sx={{ fontSize: 18 }} />}
                  label={userData.status.toUpperCase()}
                  color={isActive ? "success" : "warning"}
                  sx={{
                    fontWeight: 700,
                    px: 1,
                    backgroundColor: isActive
                      ? "rgba(16,185,129,0.16)"
                      : "rgba(245,158,11,0.18)",
                  }}
                />
              </Stack>

              {/* User Info */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={3}
                sx={{ mb: 4 }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#F9FAFB", mb: 0.5 }}
                  >
                    {userData.firstName} {userData.lastName}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(148,163,184,0.9)", mb: 0.3 }}
                  >
                    {userData.email}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ color: "rgba(148,163,184,0.9)" }}
                  >
                    <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      ZIP Code: <strong>{userData.zip}</strong>
                    </Typography>
                  </Stack>
                </Box>

                {/* Wallet pill */}
                {userData.walletAddress && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      px: 2,
                      py: 1.2,
                      borderRadius: 999,
                      backgroundColor: "rgba(15,23,42,0.85)",
                      border: "1px solid rgba(148,163,184,0.35)",
                    }}
                  >
                    <AccountBalanceWalletOutlinedIcon
                      sx={{ fontSize: 20, color: "#10B981" }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(209,213,219,0.95)" }}
                    >
                      {userData.walletAddress.slice(0, 6)}...
                      {userData.walletAddress.slice(-6)}
                    </Typography>
                  </Stack>
                )}
              </Stack>

              {/* Status + Balance Area */}
              <Box
                sx={{
                  mt: 1,
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,118,110,0.35))",
                  border: "1px solid rgba(15,185,129,0.5)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 0.6,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#FACC15" }}
                >
                  Status:&nbsp;
                  <span style={{ color: "#FACC15" }}>
                    {userData.status.toUpperCase()}
                  </span>
                </Typography>

                <Typography variant="body2" sx={{ color: "#CBD5F5" }}>
                  Policy ID:&nbsp;
                  <Link
                    sx={{
                      color: "#60A5FA",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {userData.policyId}
                  </Link>
                </Typography>

                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  Emergency Fund Balance:&nbsp;
                  <span
                    style={{
                      color: "#10B981",
                      fontWeight: 800,
                      fontSize: "1.25rem",
                    }}
                  >
                    ${userData.balance.toFixed(2)}
                  </span>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* TRANSACTION HISTORY */}
          <Card
            sx={{
              borderRadius: 6,
              background:
                "linear-gradient(145deg, rgba(15,23,42,1), rgba(15,23,42,0.95))",
              boxShadow: "0 18px 40px rgba(0,0,0,0.8)",
              border: "1px solid rgba(30,64,175,0.5)",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography
                variant="h6"
                sx={{ mb: 2.5, fontWeight: 700, color: "#E5E7EB" }}
              >
                Transaction History
              </Typography>

              {transactions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No transactions yet.
                </Typography>
              ) : (
                <>
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                      backgroundColor: "rgba(15,23,42,0.98)",
                      borderRadius: 4,
                      border: "1px solid rgba(31,41,55,0.8)",
                      overflow: "hidden",
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow
                          sx={{
                            "& th": {
                              backgroundColor: "rgba(15,23,42,1)",
                              color: "#9CA3AF",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              borderBottom:
                                "1px solid rgba(55,65,81,0.7)",
                            },
                          }}
                        >
                          <TableCell>Date</TableCell>
                          <TableCell>Event Type</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Amount (USD)</TableCell>
                          <TableCell>Amount (SOL)</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Explorer</TableCell>
                          <TableCell>Exchange Rate</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedData.map((tx) => (
                          <TableRow
                            key={tx.id}
                            sx={{
                              "&:nth-of-type(odd)": {
                                backgroundColor:
                                  "rgba(15,23,42,0.92)",
                              },
                              "&:hover": {
                                backgroundColor:
                                  "rgba(30,64,175,0.25)",
                                transition: "0.2s ease",
                                cursor: "pointer",
                                boxShadow:
                                  tx.status === "Completed"
                                    ? "0 0 12px rgba(16,185,129,0.35)"
                                    : "0 0 12px rgba(239,68,68,0.35)",
                              },
                              "& td": {
                                borderBottomColor:
                                  "rgba(31,41,55,0.6)",
                                fontSize: "0.85rem",
                                paddingY: 1.2,
                              },
                            }}
                          >
                            <TableCell>
                              {new Date(
                                tx.createdAt
                              ).toLocaleDateString()}
                            </TableCell>

                            <TableCell>{tx.type}</TableCell>
                            <TableCell>{tx.location}</TableCell>

                            <TableCell>
                              ${tx.amount.toFixed(2)}
                            </TableCell>

                            <TableCell>
                              {tx.amountSOL
                                ? tx.amountSOL.toFixed(4)
                                : "0.0000"}{" "}
                              SOL
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={tx.status}
                                color={
                                  tx.status === "Completed"
                                    ? "success"
                                    : "error"
                                }
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  px: 1,
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              {tx.explorerUrl ? (
                                <Link
                                  href={tx.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    fontSize: "0.78rem",
                                    color: "#60A5FA",
                                  }}
                                >
                                  View
                                </Link>
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  N/A
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell>
                              {tx.exchangeRate
                                ? `$${tx.exchangeRate.toFixed(
                                    2
                                  )}/SOL`
                                : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination Controls */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      p: 1.5,
                      backgroundColor: "rgba(15,23,42,0.95)",
                      borderTop:
                        "1px solid rgba(55,65,81,0.5)",
                    }}
                  >
                    <TablePagination
                      component="div"
                      count={transactions.length}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={
                        handleChangeRowsPerPage
                      }
                      rowsPerPageOptions={[5, 10, 20, 50]}
                      sx={{
                        color: "#9CA3AF",
                        "& .MuiSelect-icon": {
                          color: "#9CA3AF",
                        },
                      }}
                    />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>

      <Footer />
    </>
  );
}
