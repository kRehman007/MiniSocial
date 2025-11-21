import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Upload, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PostService } from "@/appwrite/post-service";
import { useAuthStore } from "@/zustand/useAuthStore";
import CustomLoader from "@/lib/loader";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { usePostStore } from "@/zustand/usePostStore";

interface CreatePostModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, setIsOpen }) => {
  const { addPost } = usePostStore();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // LOCATION STATES
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);


  // =============================================
  // LOCATION SEARCH FUNCTION
  // =============================================
  const getLocationSuggestions = async (query: string) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "CloudSnap" },
      });
      const data = await res.json();
      return data.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
      }));
    } catch (err) {
      console.error("Location API error", err);
      return [];
    }
  };

  // DEBOUNCE LOCATION SEARCH
  useEffect(() => {
    if (!locationQuery.trim()) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);

    const timeout = setTimeout(async () => {
      setIsSearchingLocation(true);
      const results = await getLocationSuggestions(locationQuery);
      setIsSearchingLocation(false);
      setLocationSuggestions(results);
    }, 500);

    return () => clearTimeout(timeout);
  }, [locationQuery]);

  
  useEffect(() => {
    if (!mediaFile) {
      setMediaPreview("");
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);


  const handlePost = async () => {
    if (!mediaFile) {
      toast.error("Please upload media.");
      return;
    }

    if (showLocationInput && !selectedLocation) {
      toast.error("Please select a valid location.");
      return;
    }

    const mediaType = mediaFile.type.startsWith("image/") ? "image" : "video";

    try {
      setIsLoading(true);
      const data = {
        title,
        description,
        userId: user?.$id!,
        mediaFile,
        mediaType,
        location: selectedLocation?.display_name || null,
      };

      const result = await PostService.addPost(data);
      addPost(result as any);

      toast.success("Post created successfully!");
      setTitle("");
      setDescription("");
      setMediaFile(null);
      setMediaPreview("");
      setSelectedLocation(null);
      setLocationQuery("");
      setShowLocationInput(false);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Post error:", error);
      toast.error(error.message || "Failed to create post.");
      if (error?.code?.includes("expired")) navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error("Only images or videos allowed.");
        return;
      }
      setMediaFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl w-full rounded-xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh] px-4 py-3">
          <DialogHeader>
            <DialogTitle className="text-center text-green-700">Create Post</DialogTitle>
          </DialogHeader>

          <hr className="my-4" />

          {/* USER INFO */}
          <div className="flex gap-3 items-center mt-2">
            <Avatar className="h-14 w-14">
              <AvatarImage src={"https://github.com/shadcn.png"} loading="lazy" />
              <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.fullname}</p>
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Public</span>
              </div>
            </div>
          </div>

          {/* MEDIA UPLOAD */}
          <div className="mt-4 relative">
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (showLocationInput) {
                    setSelectedLocation(null);
                    setLocationQuery("");
                  }
                  setShowLocationInput((prev) => !prev);
                }}
              >
                <MapPin className="text-gray-500 mr-1" size={18} />
                {showLocationInput ? "Hide Location" : "Add Location"}
              </Button>
            </div>

            {/* LOCATION INPUT */}
            {showLocationInput && (
              <div className="my-2 relative">
                <Input
                  placeholder="Search location..."
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setSelectedLocation(null);
                  }}
                />

                {/* SUGGESTION DROPDOWN */}
                {locationSuggestions.length > 0 && !selectedLocation && (
                  <div className="absolute bg-white border rounded-md shadow-md mt-2 w-full z-20 max-h-48 overflow-y-auto">
                    {isSearchingLocation && (
                      <p className="p-2 text-sm text-gray-500">Searching...</p>
                    )}
                    {locationSuggestions.map((loc, idx) => (
                      <p
                        key={idx}
                        onClick={() => {
                          setIsSearchingLocation(false);
                          setSelectedLocation(loc);
                          setLocationQuery(loc.display_name);
                          setLocationSuggestions([]);
                        }}
                        className="p-2 text-sm cursor-pointer hover:bg-gray-100"
                      >
                        {loc.display_name}
                      </p>
                    ))}
                  </div>
                )}

                {/* WARNING IF NO RESULTS */}
                {!isSearchingLocation &&
                 locationQuery.trim() &&
                  locationSuggestions.length === 0 &&
                  (
                    <p className="text-xs md:text-sm text-red-500 mt-1 pl-1">
                      No location found. Please enter a valid location.
                    </p>
                  )}
                  {isSearchingLocation && (
                    <div className="text-xs md:text-sm flex gap-2 items-center text-gray-500 mt-1 md:mt-2 pl-1">
                      Searching for Locations...
                      <CustomLoader size={14} />
                    </div>
                  )}
              </div>
            )}

            {/* MEDIA PREVIEW */}
            <div
              className="flex justify-center items-center border-2 border-dashed border-gray-300 rounded-md min-h-40 max-h-72 cursor-pointer hover:border-blue-500 transition overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {mediaPreview ? (
                mediaFile?.type.startsWith("image/") ? (
                  <img src={mediaPreview} className="object-contain max-h-72 w-full" />
                ) : (
                  <video src={mediaPreview} autoPlay controls className="object-cover max-h-72 w-full" />
                )
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload size={28} />
                  <span className="mt-2 text-sm">Click to upload media</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*"
              />
            </div>
          </div>

          {/* TITLE */}
          <Input
            placeholder="Title"
            className="mt-3 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* DESCRIPTION */}
          <Textarea
            placeholder="Add description..."
            className="mt-2 w-full min-h-[100px] max-h-[150px] resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* BUTTONS */}
          <div className="flex flex-col flex-row md:justify-end gap-2 mt-4">
            <Button
              disabled={
                !title.trim() ||
                !mediaFile ||
                isLoading ||
                (showLocationInput && !selectedLocation)
              }
              className="w-full md:w-28 bg-green-600 hover:bg-green-700"
              onClick={handlePost}
            >
              {isLoading ? <CustomLoader /> : "Create"}
            </Button>

            <Button
              variant="outline"
              disabled={isLoading}
              className="w-full md:w-28"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
