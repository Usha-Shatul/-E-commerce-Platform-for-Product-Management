import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import { useState } from "react";
import axios from "axios";
import ProductCard from "../components/Product/ProductCard";

function ImageSearch() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("error");
    const [searchResult, setSearchResult] = useState(null);

    // API Base URLs - make these configurable
    const PYTHON_API_URL = process.env.REACT_APP_PYTHON_API_URL || "http://18.222.63.154:5000";
    const SPRING_API_URL = process.env.REACT_APP_SPRING_API_URL || "http://18.222.63.154:8082";

    function handleFileChange(event) {
        setFile(event.target.files[0]);
        // Clear previous results when new file is selected
        setSearchResult(null);
        setAlertMessage("");
    }

    async function handleImageSearch() {
        setSearchResult(null);

        if (!file) {
            setAlertMessage("Please select an image file.");
            setAlertType("error");
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setAlertMessage("Please select a valid image file (JPEG, PNG, GIF, WEBP).");
            setAlertType("error");
            return;
        }

        // Validate file size (e.g., max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setAlertMessage("File size must be less than 10MB.");
            setAlertType("error");
            return;
        }

        setLoading(true);
        setAlertMessage("");

        const formData = new FormData();
        formData.append("image", file);

        try {
            // 1. Send image to Python backend for image recognition
            const pythonRes = await axios.post(
                `${PYTHON_API_URL}/api/v1/search-image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        // Add timeout to prevent long waits
                        timeout: 30000
                    }
                }
            );

            console.log("Python response:", pythonRes.data);

            if (!pythonRes.data || !pythonRes.data.result) {
                setAlertMessage("No similar products found. Please try a different image.");
                setAlertType("error");
                setLoading(false);
                return;
            }

            // Get matched product names from Python response
            const matchedNames = {
                image: pythonRes.data.result // array of image names
            };

            // 2. Send matched names to Spring Boot to get full product details
            const springRes = await axios.post(
                `${SPRING_API_URL}/api/v1/products/search-by-image`,
                matchedNames,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                    timeout: 30000
                }
            );

            console.log("Spring response:", springRes.data);

            // Handle different response formats
            let products = springRes.data;

            // Check if response is empty or has no results
            if (!products || (Array.isArray(products) && products.length === 0)) {
                setAlertMessage("No products found matching the image. Please try another image.");
                setAlertType("error");
                setSearchResult(null);
                return;
            }

            // If response is an array with products, store all of them
            // If it's a single product, wrap it in an array
            if (!Array.isArray(products)) {
                products = [products];
            }

            setSearchResult(products);
            setAlertMessage(`Found ${products.length} product(s)!`);
            setAlertType("success");

        } catch (error) {
            console.error("Image Search Error:", error);

            let errorMessage = "An error occurred during the search. Please try again.";

            if (error.response) {
                // The request was made and the server responded with a status code
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);

                if (error.response.status === 401) {
                    errorMessage = "Authentication failed. Please log in again.";
                } else if (error.response.status === 404) {
                    errorMessage = "API endpoint not found. Please check the server configuration.";
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "No response from server. Please check your internet connection.";
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timed out. Please try again.";
            }

            setAlertMessage(errorMessage);
            setAlertType("error");
            setSearchResult(null);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-10 px-4">
            {/* Alert Messages */}
            {alertMessage && (
                <Alert
                    type={alertType}
                    message={alertMessage}
                    onClose={() => setAlertMessage("")}
                />
            )}

            {/* Card Section */}
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    Image Search
                </h1>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleImageSearch}
                        disabled={loading || !file}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                {/* File info */}
                {file && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                )}
            </div>

            {/* Loading Spinner */}
            {loading && <Spinner />}

            {/* Results Section */}
            <div className="mt-8 w-full max-w-6xl">
                {searchResult && searchResult.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {searchResult.map((product) => (
                            <ProductCard
                                key={product.id || product.name}
                                id={product.id}
                                name={product.name}
                                img={product.imageUrl}
                                price={product.price}
                                description={product.description}
                            />
                        ))}
                    </div>
                ) : !loading && !alertMessage && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-4">
                        Upload an image to find similar products.
                    </p>
                )}
            </div>
        </div>
    );
}

export default ImageSearch;