import { Box } from "@mui/joy"

export default function Footer() {
  return (
    <Box sx={(theme) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 15px',
      height: '60px',
      borderTop: `1px solid ${
        theme.palette.mode === "light" ? "#e8eaee" : "#21262b"
      }`
    })}>
      version: 1.0.0
    </Box>
  )
}
