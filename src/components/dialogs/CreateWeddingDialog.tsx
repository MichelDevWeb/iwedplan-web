import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { 
  generateWeddingId, 
  isWeddingIdTaken, 
  createWeddingWebsite 
} from "@/lib/firebase/weddingService";
import { getCurrentUser, signInWithGoogle } from "@/lib/firebase/authService";
import { Timestamp } from "firebase/firestore";
import { Heart } from "lucide-react";

interface CreateWeddingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateWeddingDialog({ open, onOpenChange }: CreateWeddingDialogProps) {
  const router = useRouter();
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [weddingDay, setWeddingDay] = useState("");
  const [weddingMonth, setWeddingMonth] = useState("");
  const [weddingYear, setWeddingYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weddingId, setWeddingId] = useState("");
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is authenticated when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setCheckingAuth(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Error checking authentication", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    if (open) {
      checkAuth();
    }
  }, [open]);

  console.log(generateWeddingId("Nguyen Van A", "Nguyen Thi B"));

  // Update wedding ID when inputs change
  const updateWeddingId = () => {
    if (groomName && brideName) {
      // No need to pass a date - function will use current date automatically
      const newWeddingId = generateWeddingId(groomName, brideName);
      setWeddingId(newWeddingId);
    }
  };

  // Handle name changes
  const handleNameChange = (type: "groom" | "bride", value: string) => {
    if (type === "groom") {
      setGroomName(value);
    } else {
      setBrideName(value);
    }
    
    // Update wedding ID if both names are filled
    if ((type === "groom" && value && brideName) || (type === "bride" && value && groomName)) {
      setTimeout(updateWeddingId, 0);
    }
  };

  // Handle login with Google
  const handleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      await signInWithGoogle();
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setError("Đăng nhập không thành công. Vui lòng thử lại sau.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Validate form and create wedding website
  const handleCreate = async () => {
    setError("");
    setLoading(true);

    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error("Vui lòng đăng nhập để tạo website cưới");
      }

      // Validate inputs
      if (!groomName || !brideName) {
        throw new Error("Vui lòng nhập tên cô dâu và chú rể");
      }

      // Generate wedding ID if not already set
      if (!weddingId) {
        // Function will use current date automatically
        const newWeddingId = generateWeddingId(groomName, brideName);
        setWeddingId(newWeddingId);
      }

      // Check if wedding ID is already taken
      const isTaken = await isWeddingIdTaken(weddingId);
      if (isTaken) {
        throw new Error("Đã tồn tại một website cưới khác với cùng tên và ngày. Vui lòng thay đổi thông tin.");
      }

      // Create wedding data object
      const weddingData: {
        groomName: string;
        brideName: string;
        template: string;
        eventDate?: Timestamp;
        ownerId: string;
      } = {
        groomName,
        brideName,
        template: "default", // Default template
        ownerId: user.uid, // Link the wedding to the authenticated user
      };

      // Only add eventDate if all date fields are properly filled
      if (weddingYear && weddingMonth && weddingDay) {
        const year = parseInt(weddingYear);
        const month = parseInt(weddingMonth) - 1; // JavaScript months are 0-based
        const day = parseInt(weddingDay);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
            year > 2000 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
          const date = new Date(year, month, day);
          // Check if it's a valid date
          if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
            weddingData.eventDate = Timestamp.fromDate(date);
          }
        }
      }

      // Create wedding website in Firestore
      const finalWeddingId = await createWeddingWebsite(weddingData);

      // Redirect to the template selection page
      router.push(`/create/template/${finalWeddingId}`);
      onOpenChange(false);
    } catch (err) {
      console.error("Error in wedding creation:", err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  // Show login UI if user is not authenticated
  if (!checkingAuth && !user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-white z-0"></div>
          {/* Floating hearts animation */}
          <div className="absolute inset-0 overflow-hidden">
            {Array(6).fill(0).map((_, i) => (
              <div
                key={i}
                className="absolute text-pink-300 opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `scale(${Math.random() * 0.5 + 0.5})`,
                  animation: `float ${Math.random() * 5 + 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              >
                <Heart className="w-8 h-8" />
              </div>
            ))}
          </div>

          <DialogHeader className="relative z-10">
            <DialogTitle className="text-center text-2xl font-playfair text-pink-700">Đăng nhập</DialogTitle>
            <DialogDescription className="text-center">
              Vui lòng đăng nhập để tạo website cưới của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 relative z-10">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-pink-100 rounded-full animate-pulse"></div>
              <Heart className="absolute inset-0 m-auto text-pink-500 w-8 h-8" />
            </div>
            
            <p className="text-center">
              Tạo và quản lý website cưới đẹp mắt cùng iWedPlan
            </p>
            
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="relative z-10">
            <Button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
                </>
              ) : (
                "Đăng nhập với Google"
              )}
            </Button>
          </DialogFooter>
          
          <style jsx global>{`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0); }
              50% { transform: translateY(-20px) rotate(10deg); }
            }
          `}</style>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo website cưới</DialogTitle>
          <DialogDescription>
            Nhập thông tin cơ bản để bắt đầu tạo website cưới của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groomName">Tên chú rể</Label>
            <Input
              id="groomName"
              placeholder="Nguyễn Văn A"
              value={groomName}
              onChange={(e) => handleNameChange("groom", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brideName">Tên cô dâu</Label>
            <Input
              id="brideName"
              placeholder="Nguyễn Thị B"
              value={brideName}
              onChange={(e) => handleNameChange("bride", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weddingDate">Ngày cưới (tùy chọn)</Label>
            <div className="flex gap-2">
              <Input
                id="weddingDay"
                placeholder="Ngày"
                value={weddingDay}
                onChange={(e) => setWeddingDay(e.target.value)}
                disabled={loading}
                className="w-20"
              />
              <Input
                id="weddingMonth"
                placeholder="Tháng"
                value={weddingMonth}
                onChange={(e) => setWeddingMonth(e.target.value)}
                disabled={loading}
                className="w-20"
              />
              <Input
                id="weddingYear"
                placeholder="Năm"
                value={weddingYear}
                onChange={(e) => setWeddingYear(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500">
              Ví dụ: 21 04 2025
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={loading || !groomName || !brideName}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
              </>
            ) : (
              "Tiếp tục"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 