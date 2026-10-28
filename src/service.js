import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const loadDashboard = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/farmer/dashboard`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("Authorization")}`,
                "Content-Type": "application/json"
            }
        });

        const stats = res.data;

        const farmer = {
            name: res.data.farmerName,
            profilePic: `${BASE_URL}/uploads/profiles/${res.data.profilePic}`,
            quote: "Fresh food starts with passionate farmers."
        };

        return [stats, farmer];

    } catch (error) {

        const stats = {
            products: 142,
            orders: 24,
            revenue: 12450,
            rating: 4.9
        };


        const farmer = {
            name: "Rakesh",
            profilePic: "https://i.pravatar.cc/200?img=12",
            quote: "Healthy farms create healthy lives."
        };

        return [stats, farmer];
    }

}
    export const loadReviews = async () => {
       
let reviews = [{}];


try {
  const res= await axios.get(`${BASE_URL}/farmer/products/reviews`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("Authorization")}`,
      "Content-Type": "application/json"
    }
  });
  reviews = res.data;
  console.log("Fetched reviews:", res.data);
}
catch (error) {
    console.error("Error fetching reviews:", error);
}

         return reviews;
    }







   export  const   loadUserProfile = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/farmer/details`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("Authorization")}`,
                    "Content-Type": "application/json"
                }
            });
            return res.data;
            console.log("Fetched user profile:", res.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    }


    export const loadFarmerEarnings = async (pnum) => {

        try {
            const res = await axios.get(`${BASE_URL}/farmer/earnings/${pnum}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("Authorization")}`,
                    "Content-Type": "application/json"
                }
            });
            return res.data;
        } catch (error) {
            console.error("Error fetching farmer earnings:", error);
            return null;
        }
    }
