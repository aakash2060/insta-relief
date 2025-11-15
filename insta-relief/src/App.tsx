import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Typography, Box } from "@mui/material";
import AppThemeProvider from "./theme/AppThemeProvider";

export default function App() {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Welcome to InstaRelief
          </Typography>
        </Box>

        <Routes>
          
        </Routes>
      </BrowserRouter>
    </AppThemeProvider>
  );
}
