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
    <Box px={4} py={20} mx="auto">
      <Box
        w={{
          base: "full",
          md: 11 / 12,
          xl: 8 / 12,
        }}
        textAlign={{
          base: "left",
          md: "center",
        }}
        mx="auto"
      >
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
          _dark={{
            color: "gray.100",
          }}
          lineHeight="shorter"
          textAlign={"center"}
        >
          Unleash Your Creativity with Unlimited File Storage.
        </chakra.h1>
        <chakra.p
          mb={6}
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
            md: 7 / 12,
          }}
          columns={{
            base: 1,
            lg: 6,
          }}
          spacing={3}
          pt={1}
          mx="auto"
          mb={8}
        >
          <GridItem
            as="label"
            colSpan={{
              base: "auto",
              lg: 4,
            }}
          >
            <Input
              mt={0}
              size="lg"
              type="text"
              placeholder="Choose file..."
              value={selectedFile ? selectedFile.name : ""}
              isReadOnly={true}
              onClick={handleChooseFile}
              focusBorderColor={"inherit"}
              isDisabled={isLoading}
            />
            <Input
              placeholder="Select Date and Time"
              size="md"
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
          mb={3}
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
            base: "start",
            md: "center",
          }}
          mb={3}
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
    </Box>
  );
}
export default Home;
