'use client'
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, TextField, Paper, Button, Stack, useMediaQuery, createTheme, ThemeProvider, CssBaseline, Slide, IconButton } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { DarkMode, LightMode, AccountCircle } from '@mui/icons-material';  // Import icons
//import { useRouter } from 'next/router';
//import MaterialTable from 'material-table'
//import { firestore } from "firebase/firestore";

export default function Home() {
  //const router = useRouter();

  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: '', name: '', quantity: 0, image: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [image, setImage] = useState("");
  const [toggleOpen, setToggleOpen] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  

  const [darkMode, setDarkMode] = useState(prefersDarkMode);



  const toggleTheme = () => {
  setDarkMode((prevMode) => {
    const newMode = !prevMode;
    localStorage.setItem('darkMode', newMode);
    return newMode;
  });
  };
//   const handleSignIn = () => {
//   useEffect(() => {
//     if (router.isReady) {
//       router.push('/signin');
//     } else {
//       console.error('Router is not ready');
//     }
//   }, [router.isReady]);
// };


  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode],
  );

  const updateInventory = async () => {
  const snapshot = query(collection(firestore, 'inventory'));
  const docs = await getDocs(snapshot);
  const inventoryList = [];
  docs.forEach((doc) => {
    inventoryList.push({
      id: doc.id,  // Using Firestore document ID as the unique identifier
      name: doc.data().name,
      quantity: doc.data().quantity,
      image: doc.data().image
    });
  });
  setInventory(inventoryList);
};


  const addItem = async (itemName, imageURL) => {
    console.log("Hey")
  if (!itemName) return;

  // Query the Firestore collection for an item with the same name
  const itemQuery = query(collection(firestore, 'inventory'), where("name", "==", itemName));
  const querySnapshot = await getDocs(itemQuery);

  if (!querySnapshot.empty) {
    // If the item exists, update its quantity and image
    const existingItem = querySnapshot.docs[0];
    const { quantity, image } = existingItem.data();
    const docRef = doc(firestore, 'inventory', existingItem.id);

    await setDoc(docRef, {
      name: itemName,
      quantity: quantity + 1,
      image: image || imageURL || ''  // Use the existing image or the new one if provided
    }, { merge: true });
  } else {
    // If the item doesn't exist, create a new document
    const docRef = doc(collection(firestore, 'inventory'));
    await setDoc(docRef, {
      name: itemName,
      quantity: 1,
      image: imageURL || ''  // Default to empty string if imageURL is undefined
    });
  }

  await updateInventory();
};



  const removeItem = async (id) => {
  const docRef = doc(firestore, 'inventory', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const { name, quantity, image } = docSnap.data();
    if (quantity === 1) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { 
        name, 
        quantity: quantity - 1, 
        image  // Retain the image field during updates
      }, { merge: true });
    }
  }
  await updateInventory();
};



  const handleOpen = (item = { id: '', name: '', quantity: 0, image: '' }) => {
  setCurrentItem(item);
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
  setCurrentItem({ id: '', name: '', quantity: 0, image: '' }); // Reset currentItem on close
  setImage(''); // Reset image state
};

  const handleUpdate = async () => {
  const { id, name, quantity, image } = currentItem;

  if (!name || quantity < 1) {
    setErrorMessage("Invalid input. Please enter a valid name and quantity.");
    return;
  }

  if (!image) {
    setErrorMessage("Please enter an image URL.");
    return;
  }

  try {
    setErrorMessage('');
    
    const docRef = id
      ? doc(firestore, 'inventory', id)  // Use the Firestore `id`
      : doc(collection(firestore, 'inventory'));

    await setDoc(docRef, { 
      name, 
      quantity, 
      image 
    }, { merge: true });
    
    await updateInventory();
    handleClose();

  } catch (error) {
    console.error("Error updating document:", error);
    setErrorMessage("Failed to save the item. Please try again.");
  }
};




  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    } else {
      setDarkMode(prefersDarkMode); 
    }
    setToggleOpen(true);
    updateInventory();  // If this is still relevant to the component's logic
  }, [prefersDarkMode]);


  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        
        <Box
          width="100vw"
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <Slide
            direction="right"
            in={toggleOpen}
            mountOnEnter
            unmountOnExit
          >
            <Box
              position="absolute"
              top={16}
              right={16}
              p={1}
              bgcolor="background.paper"
              borderRadius={1}
              boxShadow={3}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <IconButton onClick={toggleTheme}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
              <IconButton >
                <AccountCircle />
              </IconButton>
            <Box
                width={60}
                height={30}
                borderRadius={15}
                bgcolor={darkMode ? '#333' : '#eee'}
                display="flex"
                alignItems="center"
                justifyContent={darkMode ? 'flex-end' : 'flex-start'}
                p={1}
                boxShadow={1}
                sx={{ transition: 'background-color 0.3s, justify-content 0.3s' }}
              >
                <Box
                  width={24}
                  height={24}
                  bgcolor="primary.main"
                  borderRadius="50%"
                />
              </Box>
            </Box>
          </Slide>
          <Typography variant="h4" align="center">Inventory Items</Typography>

          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ width: '800px' }}>
            <TextField
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={() => handleOpen()}>
              Add New Item
            </Button>
          </Stack>

          <TableContainer component={Paper} sx={{ maxWidth: 800 }}>
            <Table aria-label="inventory table">
              <TableHead>
                <TableRow>
                  <TableCell align="center"><Typography variant="h6">ID</Typography></TableCell>
                  <TableCell align="center"><Typography variant="h6">Item Name</Typography></TableCell>
                  <TableCell align="center"><Typography variant="h6">Quantity</Typography></TableCell>
                  <TableCell align="center"><Typography variant="h6">Image</Typography></TableCell>
                  <TableCell align="center"><Typography variant="h6">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventory.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{row.name}</TableCell>
                    <TableCell align="center">{row.quantity}</TableCell>
                    <TableCell align="center">
                      {/* {console.log(row.image)} */}
                      {row.image ? <img src={row.image} alt={row.name} style={{ width: '50px', height: '50px' }} /> : 'No image'}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={2} justifyContent="center">
                        <Button variant="contained" color="primary" onClick={() => {
                          console.log("Add button clicked");
                          addItem(row.name);
                        }}>
                          Add
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => removeItem(row.id)}>Remove</Button>
                        <Button variant="contained" color="info" onClick={() => handleOpen(row)}>Update</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Modal for updating or adding a new item */}
          <Modal open={open} onClose={handleClose}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              width={400}
              bgcolor="background.paper"
              p={4}
              borderRadius={2}
              boxShadow={24}
            >
              <Typography variant="h6" mb={2}>{currentItem.id ? "Update Item" : "Add New Item"}</Typography>
              <TextField
                fullWidth
                label="Item Name"
                variant="outlined"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Quantity"
                variant="outlined"
                type="number"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                margin="normal"
            />
            <TextField
                fullWidth
                label="Image URL"
                variant="outlined"
                value={currentItem.image}
                onChange={(e) => setCurrentItem({ ...currentItem, image: e.target.value })}
                margin="normal"
              />
              {/* Image Upload Field */}
              {/* <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImage(e.target.files[0]);
                    }
                  }}
                /> */}
              {errorMessage && (
                  <Typography variant="body2" color="error" align="center" mt={2}>
                    {errorMessage}
                  </Typography>
                )}
              {/* <TextField
                fullWidth
                label="Image URL"
                variant="outlined"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                margin="normal"
              /> */}
              <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
                <Button variant="contained" onClick={handleUpdate}>Save</Button>
                <Button variant="outlined" onClick={handleClose}>Cancel</Button>
              </Stack>
              
            </Box>
        </Modal>
        {/* <Button onClick={toggleTheme}>Toggle Theme</Button> */}
        </Box>
    </ThemeProvider>
  );

  // return (
  //   <Box
  //     width="100vw"
  //     height="100vh"
  //     display="flex"
  //     flexDirection= "column"
  //     justifyContent="center"
  //     alignItems="center"
  //     gap={2}
  //   >
  //     <Modal open={open} onClose={handleClose}>
  //       <Box
  //         position="absolute"
  //         top="50%"
  //         left="50%"
  //         width={400}
  //         bgcolor="white"
  //         border="2px solid #000"
  //         boxShadow={24}
  //         p={4}
  //         display="flex"
  //         flexDirection="column"
  //         gap={3}
  //         sx={
  //           {
  //             transform: "translate(-50%, -50%)"
  //           }
  //         }
  //       >
  //         <Typography variant="h6">Add Item</Typography>
  //         <Stack width="100%" direction="row" spacing={2}>
  //           <TextField
  //             variant="outlined"
  //             fullWidth
  //             value={itemName}
  //             onChange={(e) => {
  //               setItemName(e.target.value)
  //             }}
  //           />
  //           <Button
  //             variant="outlined"
  //             onClick={() => {
  //             addItem(itemName)
  //             setItemName('')
  //             handleClose()
  //           }}>
  //             Add
  //           </Button>
  //         </Stack>
  //       </Box>
  //     </Modal>
  //     <Button
  //       variant="contained"
  //       onClick={() => {
  //         handleOpen()
  //       }}
  //     >
  //       Add New Item
  //     </Button>
  //     <Box border="1px solid #333">
  //       <Box
  //         width="800px"
  //         height="100px"
  //         bgcolor="#ADD8E6"
  //         display="flex"
  //         alignItems="center"
  //         justifyContent="center"
  //       >
  //         <Typography variant="h2" color="#333" >
  //           Inventory Items
  //         </Typography>
  //       </Box>
  //     <Stack width="800px" height="300px" spacing={2} overflow="auto">
  //       {
  //         inventory.map( ({name, quantity}) => (
  //           <Box
  //             key={name}
  //             width="100%"
  //             minHeight="150px"
  //             display="flex"
  //             justifyContent="space-between"
  //             bgcolor="#f0f0f0"
  //             padding={5}
  //           >
  //             <Typography
  //               variant="h3"
  //               color='#333'
  //               textAlign="center"
  //             >
  //               {name.charAt(0).toUpperCase() + name.slice(1)}
  //             </Typography>
  //             <Typography
  //               variant="h3"
  //               color='#333'
  //               textAlign="center"
  //             >
  //               {quantity}
  //             </Typography>
  //             <Stack direction= "row" spacing={2}>
  //                 <Button
  //               variant="contained"
  //               onClick={() => {
  //                 addItem(name)
  //               }}
  //             >
  //               Add
  //             </Button>
  //             <Button
  //               variant="contained"
  //               onClick={() => {
  //                 removeItem(name)
  //               }}
  //             >
  //               Remove
  //               </Button>
  //               <Button
  //               variant="contained"
  //               onClick={() => {
  //                 addItem(name)
  //               }}
  //             >
  //               Update
  //             </Button>
  //             </Stack>
               
  //           </Box>
  //         ))
  //       }
  //       </Stack>
  //       </Box>
  //     </Box>
  //     )
}
