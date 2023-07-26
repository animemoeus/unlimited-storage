"use client";

import { useRef, useState } from "react";

import axios from "axios";

import { calculatePercentage } from "../utils";

import {
  Box,
  Button,
  Flex,
  GridItem,
  Icon,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  chakra,
  useToast,
} from "@chakra-ui/react";

function Home() {
  let CHUNK_SIZE = 5; // MB

  const toast = useToast();
  const fileInputRef = useRef(null);

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const saveChunkedFileData = async (selectedFile, fileUrls) => {
    setUploadStatus("Getting the file url...");

    try {
      const response = await axios.post(
        "https://discord-storage.animemoe.us/chunked-file/",
        JSON.stringify({
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_urls: fileUrls.join(","),
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setUploadStatus(
        `File URL: https://unlimited-storage.animemoe.us/download?file_id=${response.data.data.uuid}`
      );
    } catch (error) {
      setIsLoading(false);
      setUploadStatus("");
      toast({
        description: `${error.message}`,
        status: "error",
        position: "top-right",
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleChunkFileUpload = async () => {
    if (!selectedFile) {
      toast({
        description: "Please select file first",
        status: "warning",
        position: "top-right",
        duration: 5000,
        isClosable: true,
      });

      return;
    }

    if (selectedFile) {
      setIsLoading(true);

      const chunkSize = CHUNK_SIZE * 1024 * 1024;
      const totalChunks = Math.ceil(selectedFile.size / chunkSize);
      const uploadedChunkFileUrls = [];

      // Split the file into chunks
      const chunks = [];
      let offset = 0;
      for (let i = 0; i < totalChunks; i++) {
        const chunk = selectedFile.slice(offset, offset + chunkSize);
        const renamedChunk = new File([chunk], `discord-storage.bin`, {
          type: chunk.type,
        });
        chunks.push(renamedChunk);
        offset += chunkSize;
      }

      try {
        setUploadStatus("Uploading...");

        // Upload each chunk one by one
        for (let i = 0; i < totalChunks; i++) {
          const formData = new FormData();
          formData.append("file", chunks[i]);

          const response = await axios.post(
            "https://discord-storage.animemoe.us/api/upload-from-file/",
            formData
          );

          const data = response.data;
          const chunkDownloadUrl = data.url;
          uploadedChunkFileUrls.push(chunkDownloadUrl);

          setUploadStatus(
            `Uploading ${calculatePercentage(i + 1, totalChunks)}`
          );
        }

        saveChunkedFileData(selectedFile, uploadedChunkFileUrls);
        setUploadStatus("File uploaded successfully.");
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setUploadStatus("");
        toast({
          description: `${error.message}`,
          status: "error",
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const Feature = (props) => (
    <Flex
      alignItems="center"
      color={null}
      _dark={{
        color: "white",
      }}
    >
      <Icon
        boxSize={4}
        mr={1}
        color="green.600"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        ></path>
      </Icon>
      {props.children}
    </Flex>
  );

  return (
    <Box p={1} pt={"12vh"} height={"100vh"}>
      <Box p={3}>
        <chakra.h1
          mb={3}
          fontSize={{
            base: "4xl",
            md: "5xl",
          }}
          fontWeight={{
            base: "bold",
            md: "extrabold",
          }}
          color="gray.900"
          lineHeight="shorter"
          textAlign={"center"}
        >
          Unleash Your Creativity with Unlimited File Storage
        </chakra.h1>
        <chakra.p
          my={6}
          fontSize={{
            base: "lg",
            md: "xl",
          }}
          textAlign={"center"}
          color="gray.500"
          lineHeight="base"
        >
          ヾ(≧ ▽ ≦)ゝ
        </chakra.p>
        <SimpleGrid
          as="form"
          w={{
            base: "full",
            md: 10 / 12,
          }}
          columns={{
            base: 1,
            lg: 6,
          }}
          spacing={3}
          mx="auto"
          mb={8}
        >
          <GridItem
            // as="label"
            colSpan={{
              base: "auto",
              lg: 4,
            }}
          >
            <Input
              size="lg"
              type="text"
              placeholder="Choose file..."
              value={selectedFile?.name ?? ""}
              isReadOnly={true}
              onClick={handleChooseFile}
              focusBorderColor={"inherit"}
              isDisabled={isLoading}
            />
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              hidden={true}
            />
          </GridItem>
          <Button
            as={GridItem}
            w="full"
            variant="solid"
            colSpan={{
              base: "auto",
              lg: 2,
            }}
            size="lg"
            type="submit"
            colorScheme="purple"
            cursor="pointer"
            isDisabled={isLoading}
            onClick={handleChunkFileUpload}
          >
            {isLoading ? <Spinner /> : "Upload"}
          </Button>
        </SimpleGrid>
        <Stack
          display="flex"
          direction={{
            base: "column",
            md: "row",
          }}
          justifyContent={{
            base: "start",
            md: "center",
          }}
          mb={5}
          spacing={{
            base: 2,
            md: 8,
          }}
          fontSize="xs"
          color="gray.600"
        >
          <chakra.h6 textAlign={"center"}>{uploadStatus}</chakra.h6>
        </Stack>
        <Stack
          display="flex"
          direction={{
            base: "column",
            md: "row",
          }}
          justifyContent={{
            base: "center",
            md: "center",
          }}
          spacing={{
            base: 2,
            md: 8,
          }}
          fontSize="xs"
          color="gray.600"
        >
          <Feature>Unlimited Storage Space</Feature>
          <Feature> Seamless Accessibility</Feature>
          <Feature>Robust Security and Privacy</Feature>
        </Stack>
      </Box>
      {/* footer */}
      <Flex
        w="full"
        bg="#edf3f8"
        _dark={{
          bg: "#3e3e3e",
        }}
        py={2}
        pb={1}
        alignItems="center"
        justifyContent="center"
        position="fixed"
        bottom={0}
      >
        <Flex
          w="full"
          // as="footer"
          flexDir={{
            base: "column",
            sm: "row",
          }}
          align="center"
          justify="space-between"
          px="3"
          py="2"
          bg="white"
        >
          <chakra.p fontSize="xl" fontWeight="bold" color="gray.600" m={2}>
            Unlimited Storage
          </chakra.p>

          <Flex>
            <chakra.a
              href="https://github.com/animemoeus/unlimited-storage"
              mx="2"
              color="gray.600"
              _dark={{
                color: "gray.300",
                _hover: {
                  color: "gray.400",
                },
              }}
              _hover={{
                color: "gray.500",
              }}
              aria-label="Github"
            >
              <Icon boxSize="5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.026 2C7.13295 1.99937 2.96183 5.54799 2.17842 10.3779C1.395 15.2079 4.23061 19.893 8.87302 21.439C9.37302 21.529 9.55202 21.222 9.55202 20.958C9.55202 20.721 9.54402 20.093 9.54102 19.258C6.76602 19.858 6.18002 17.92 6.18002 17.92C5.99733 17.317 5.60459 16.7993 5.07302 16.461C4.17302 15.842 5.14202 15.856 5.14202 15.856C5.78269 15.9438 6.34657 16.3235 6.66902 16.884C6.94195 17.3803 7.40177 17.747 7.94632 17.9026C8.49087 18.0583 9.07503 17.99 9.56902 17.713C9.61544 17.207 9.84055 16.7341 10.204 16.379C7.99002 16.128 5.66202 15.272 5.66202 11.449C5.64973 10.4602 6.01691 9.5043 6.68802 8.778C6.38437 7.91731 6.42013 6.97325 6.78802 6.138C6.78802 6.138 7.62502 5.869 9.53002 7.159C11.1639 6.71101 12.8882 6.71101 14.522 7.159C16.428 5.868 17.264 6.138 17.264 6.138C17.6336 6.97286 17.6694 7.91757 17.364 8.778C18.0376 9.50423 18.4045 10.4626 18.388 11.453C18.388 15.286 16.058 16.128 13.836 16.375C14.3153 16.8651 14.5612 17.5373 14.511 18.221C14.511 19.555 14.499 20.631 14.499 20.958C14.499 21.225 14.677 21.535 15.186 21.437C19.8265 19.8884 22.6591 15.203 21.874 10.3743C21.089 5.54565 16.9181 1.99888 12.026 2Z"></path>
              </Icon>
            </chakra.a>
          </Flex>
        </Flex>
      </Flex>
      {/* end footer */}
    </Box>
  );
}
export default Home;
