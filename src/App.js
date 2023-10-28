import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";

function App() {
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [links, setLinks] = useState(() => {
    const storedLinks = localStorage.getItem("shortenedLinks");
    return storedLinks ? JSON.parse(storedLinks) : [];
  });
  const [timers, setTimers] = useState({});
  const [error, setError] = useState("");

  const startTimer = (linkId, expirationTime) => {
    const timerId = setTimeout(() => {
      handleDeleteLink(linkId);
    }, expirationTime * 1000 * 60);
    setTimers((prevTimers) => ({
      ...prevTimers,
      [linkId]: timerId,
    }));
  };

  useEffect(() => {
    links.forEach((link) => {
      if (link.expirationTime) {
        startTimer(link.id, link.expirationTime);
      }
    });
  }, [links]);

  const handleDeleteLink = (linkId) => {
    clearTimeout(timers[linkId]); // Clear the timer for the link
    const updatedLinks = links.filter((link) => link.id !== linkId);
    setLinks(updatedLinks);
    localStorage.setItem("shortenedLinks", JSON.stringify(updatedLinks));
  };

  const handleChange = (event) => {
    setTime(event.target.value);
    setError("");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (time && inputValue) {
        const requestBody = {
          long_url: inputValue,
          domain: "bit.ly",
          group_guid: "",
        };

        const config = {
          headers: {
            Authorization: "Bearer 80dfa7dff5a9650d00a31139ca65118c95fe1d0e",
            "Content-Type": "application/json",
          },
        };

        const res = await axios.post(
          "https://api-ssl.bitly.com/v4/shorten",
          requestBody,
          config
        );

        const newLink = {
          id: Date.now(),
          link: res.data.link,
          expirationTime: time,
        };

        setLinks([...links, newLink]);

        startTimer(newLink.id, Number(newLink.expirationTime));

        localStorage.setItem(
          "shortenedLinks",
          JSON.stringify([...links, newLink])
        );

        setInputValue("");
        setTime("");
      } else {
        setError("Please select an expiration time and provide a URL.");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Grid container>
        <Grid
          item
          xs={3.5}
          sx={{
            backgroundColor: "#EFEFEF",
            height: "600px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "25px",
            pt: "50px",
          }}
        >
          <Box
            component="img"
            src="logo.png"
            sx={{ width: { xs: "100%", sm: "100px" } }}
          />
          <Box>
            <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
              My shortened URLs
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {links.map((link) => (
              <Box
                key={link.id}
                sx={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <a
                  href={link.link}
                  style={{ color: "#1b9de5" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.link}
                </a>
                <DeleteIcon
                  onClick={() => handleDeleteLink(link.id)}
                  style={{ cursor: "pointer" }}
                />
              </Box>
            ))}
          </Box>
        </Grid>
        <Grid
          xs={8.5}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            gap: "25px",
            pt: "50px",
            pl: "150px",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "28px", fontWeight: 600 }}>
              URL Shortener
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <TextField
                  sx={{ width: "400px" }}
                  id="outlined-url-input"
                  label="Paste the URL to be shortened"
                  type="url"
                  autoComplete="current-url"
                  size="small"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                {error && (
                  <Typography sx={{ color: "red", fontSize: "12px" }}>
                    {error}
                  </Typography>
                )}
              </Box>
              <FormControl sx={{ m: 1, minWidth: 210 }} size="small">
                <InputLabel id="demo-select-small-label">
                  Add expiration date
                </InputLabel>
                <Select
                  labelId="demo-select-small-label"
                  id="demo-select-small"
                  value={time}
                  label="Add expiration date"
                  onChange={handleChange}
                >
                  <MenuItem value={1}>1 minute</MenuItem>
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={30}>30 minute</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={300}>5 hour</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "start",
              }}
            >
              <Button
                onClick={fetchData}
                sx={{
                  backgroundColor: "#92278F",
                  color: "#fff",
                  p: "8px 25px",
                  "&:hover": {
                    backgroundColor: "#92278F",
                  },
                  "&:active": {
                    backgroundColor: "#92278F",
                  },
                }}
              >
                Shorten URL
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;
