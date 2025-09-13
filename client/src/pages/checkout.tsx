import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/auth/login-dialog";
import { RegisterDialog } from "@/components/auth/register-dialog";
import { CloverPayment } from "@/components/payment/clover-payment";
import { ArrowLeft, CreditCard, Package, Truck, MapPin, Phone, Mail, BookOpen, Check, AlertTriangle, UserX, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  // Shipping Address Fields
  addressLine1: z.string().min(5, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  zipCode: z.string().min(5, "ZIP/Postal code is required"),
  country: z.string().min(2, "Country is required"),
  deliveryInstructions: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment'>('shipping');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState<any>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string>('');
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidation, setAddressValidation] = useState<any>(null);
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [selectedState, setSelectedState] = useState<string>("");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Handle login/register dialog switching
  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  // States/Provinces data for each country
  const statesByCountry: Record<string, string[]> = {
    US: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
      "Wisconsin", "Wyoming"
    ],
    CA: [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
      "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
      "Quebec", "Saskatchewan", "Yukon"
    ],
    MX: [
      "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
      "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo",
      "Jalisco", "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
      "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
      "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
    ],
    GB: [
      "England", "Scotland", "Wales", "Northern Ireland"
    ],
    AU: [
      "New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia",
      "Tasmania", "Northern Territory", "Australian Capital Territory"
    ]
  };

  // Cities data organized by country and state
  const citiesByCountryAndState: Record<string, Record<string, string[]>> = {
    US: {
      "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa", "Hoover", "Dothan", "Auburn", "Decatur", "Madison"],
      "Alaska": ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "Wasilla", "Kenai", "Kodiak", "Bethel", "Palmer"],
      "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Glendale", "Scottsdale", "Gilbert", "Tempe", "Peoria", "Surprise"],
      "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "North Little Rock", "Conway", "Rogers", "Pine Bluff", "Bentonville"],
      "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno", "Long Beach", "Oakland", "Stockton", "Anaheim"],
      "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo", "Centennial"],
      "Connecticut": ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "Norwalk", "Danbury", "New Britain", "West Hartford", "Greenwich"],
      "Delaware": ["Wilmington", "Dover", "Newark", "Middletown", "Bear", "Glasgow", "Brookside", "Hockessin", "Smyrna", "Claymont"],
      "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral"],
      "Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Sandy Springs", "Roswell", "Macon", "Johns Creek", "Albany"],
      "Hawaii": ["Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu", "Kaneohe", "Mililani Town", "Kahului", "Ewa Gentry", "Mililani Mauka"],
      "Idaho": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell", "Coeur d'Alene", "Twin Falls", "Lewiston", "Post Falls"],
      "Illinois": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin", "Waukegan", "Cicero"],
      "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond", "Gary", "Muncie"],
      "Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Waterloo", "Iowa City", "Council Bluffs", "Ames", "Dubuque", "West Des Moines"],
      "Kansas": ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe", "Lawrence", "Shawnee", "Salina", "Hutchinson", "Lenexa"],
      "Kentucky": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Richmond", "Georgetown", "Florence", "Hopkinsville", "Nicholasville"],
      "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Monroe", "Alexandria", "Marrero"],
      "Maine": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Biddeford", "Sanford", "Saco", "Augusta", "Westbrook"],
      "Maryland": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Hagerstown", "Annapolis", "College Park", "Salisbury", "Laurel"],
      "Massachusetts": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge", "New Bedford", "Brockton", "Quincy", "Lynn", "Fall River"],
      "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing", "Ann Arbor", "Flint", "Dearborn", "Livonia", "Westland"],
      "Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth", "Saint Cloud", "Eagan", "Woodbury"],
      "Mississippi": ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi", "Meridian", "Tupelo", "Greenville", "Olive Branch", "Horn Lake"],
      "Missouri": ["Kansas City", "St. Louis", "Springfield", "Independence", "Columbia", "Lee's Summit", "O'Fallon", "St. Joseph", "St. Charles", "St. Peters"],
      "Montana": ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena", "Kalispell", "Havre", "Anaconda", "Miles City"],
      "Nebraska": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont", "Hastings", "North Platte", "Norfolk", "Columbus"],
      "Nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City", "Fernley", "Elko", "Mesquite", "Boulder City"],
      "New Hampshire": ["Manchester", "Nashua", "Concord", "Derry", "Rochester", "Dover", "Merrimack", "Salem", "Hudson", "Londonderry"],
      "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Woodbridge", "Lakewood", "Toms River", "Hamilton Township", "Trenton"],
      "New Mexico": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "Farmington", "Clovis", "Hobbs", "Alamogordo", "Carlsbad"],
      "New York": ["New York", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
      "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Asheville"],
      "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Williston", "Dickinson", "Mandan", "Jamestown", "Wahpeton"],
      "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Lorain", "Hamilton"],
      "Oklahoma": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton", "Edmond", "Moore", "Midwest City", "Enid", "Stillwater"],
      "Oregon": ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro", "Bend", "Beaverton", "Medford", "Springfield", "Corvallis"],
      "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Levittown", "Harrisburg"],
      "Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence", "Woonsocket", "Newport", "Central Falls", "Westerly", "North Providence"],
      "South Carolina": ["Columbia", "Charleston", "North Charleston", "Mount Pleasant", "Rock Hill", "Greenville", "Summerville", "Sumter", "Goose Creek", "Hilton Head Island"],
      "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Mitchell", "Yankton", "Pierre", "Huron", "Spearfish"],
      "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Johnson City", "Bartlett", "Hendersonville"],
      "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"],
      "Utah": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "Ogden", "St. George", "Layton", "Taylorsville"],
      "Vermont": ["Burlington", "Essex", "South Burlington", "Colchester", "Rutland", "Bennington", "Brattleboro", "Milton", "Hartford", "Middlebury"],
      "Virginia": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton", "Portsmouth", "Suffolk", "Roanoke"],
      "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Federal Way", "Spokane Valley"],
      "West Virginia": ["Charleston", "Huntington", "Parkersburg", "Morgantown", "Wheeling", "Weirton", "Fairmont", "Martinsburg", "Beckley", "Clarksburg"],
      "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Oshkosh", "Eau Claire", "Janesville"],
      "Wyoming": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Green River", "Evanston", "Riverton", "Jackson"]
    },
    CA: {
      "Ontario": ["Toronto", "Ottawa", "Hamilton", "London", "Kitchener", "Windsor", "Oshawa", "Kingston", "Guelph", "Cambridge"],
      "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Sherbrooke", "Trois-Rivières", "Saguenay", "Lévis", "Terrebonne", "Saint-Jean-sur-Richelieu"],
      "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Coquitlam", "Kelowna", "Saanich", "Delta"],
      "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove", "Leduc"],
      "Manitoba": ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie", "Winkler", "Selkirk", "Morden", "Dauphin", "The Pas"],
      "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current", "Yorkton", "North Battleford", "Estevan", "Weyburn", "Lloydminster"]
    },
    MX: {
      "México": ["Mexico City", "Toluca", "Ecatepec", "Naucalpan", "Tlalnepantla", "Chimalhuacán", "Cuautitlán Izcalli", "Atizapán de Zaragoza", "Nezahualcóyotl", "Tultitlán"],
      "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta", "Tlajomulco de Zúñiga", "El Salto", "Tepatitlán", "Ocotlán", "Lagos de Moreno"],
      "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca", "General Escobedo", "Santa Catarina", "San Pedro Garza García", "Cadereyta Jiménez", "Carmen", "Juárez"],
      "Puebla": ["Puebla", "Tehuacán", "San Martín Texmelucan", "Atlixco", "San Pedro Cholula", "Amozoc", "Huauchinango", "San Andrés Cholula", "Teziutlán", "Cuautlancingo"],
      "Baja California": ["Tijuana", "Mexicali", "Ensenada", "Rosarito", "Tecate", "San Felipe", "Vicente Guerrero", "Guadalupe Victoria", "El Rosario", "Ejido Eréndira"]
    },
    GB: {
      "England": ["London", "Birmingham", "Manchester", "Liverpool", "Newcastle", "Sheffield", "Bristol", "Leeds", "Leicester", "Coventry"],
      "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Stirling", "Perth", "Inverness", "Paisley", "East Kilbride", "Livingston"],
      "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Caerphilly", "Bridgend", "Neath", "Port Talbot", "Cwmbran"],
      "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newtownabbey", "Bangor", "Craigavon", "Castlereagh", "Ballymena", "Newry", "Carrickfergus"]
    },
    AU: {
      "New South Wales": ["Sydney", "Newcastle", "Central Coast", "Wollongong", "Albury", "Wagga Wagga", "Port Macquarie", "Tamworth", "Orange", "Dubbo"],
      "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Traralgon", "Warrnambool", "Horsham", "Sale", "Wangaratta"],
      "Queensland": ["Brisbane", "Gold Coast", "Townsville", "Cairns", "Toowoomba", "Mackay", "Rockhampton", "Bundaberg", "Hervey Bay", "Gladstone"],
      "Western Australia": ["Perth", "Bunbury", "Geraldton", "Kalgoorlie", "Mandurah", "Albany", "Port Hedland", "Broome", "Busselton", "Esperance"],
      "South Australia": ["Adelaide", "Mount Gambier", "Whyalla", "Murray Bridge", "Port Lincoln", "Port Augusta", "Victor Harbor", "Gawler", "Port Pirie", "Kadina"],
      "Tasmania": ["Hobart", "Launceston", "Devonport", "Burnie", "Ulverstone", "Kingston", "Glenorchy", "Clarence", "Wynyard", "Sorell"]
    }
  };
  
  // Fetch saved addresses
  const { data: savedAddressesData = [] } = useQuery<any[]>({
    queryKey: ["/api/addresses"],
    refetchOnWindowFocus: false,
  });

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (savedAddressesData.length > 0 && !selectedSavedAddress) {
      const defaultAddress = savedAddressesData.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedSavedAddress(defaultAddress.id.toString());
        loadSavedAddress(defaultAddress.id.toString());
      }
    }
  }, [savedAddressesData]);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      deliveryInstructions: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      return response.json();
    },
    onSuccess: async (order) => {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id} has been placed. We'll send you updates via email.`,
      });
      await clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setLocation("/");
    },
    onError: (error) => {
      setIsProcessingPayment(false);
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const subtotalAmount = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);
  
  const salesTaxRate = 0.0667; // 6.67% sales tax
  const taxAmount = subtotalAmount * salesTaxRate;
  const shippingAmount = selectedShippingRate?.cost || 0;
  const totalAmount = subtotalAmount + taxAmount + shippingAmount;

  const validateAddress = async (formData: CheckoutForm) => {
    setIsValidatingAddress(true);
    try {
      const response = await fetch('/api/address/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        }),
      });
      if (response.ok) {
        const validation = await response.json();
        setAddressValidation(validation);
        return validation.isValid;
      }
    } catch (error) {
      console.error('Address validation failed:', error);
      setAddressValidation({ isValid: true, errors: [], warnings: [] });
    }
    setIsValidatingAddress(false);
    return true;
  };

  const getShippingRates = async (formData: CheckoutForm) => {
    setLoadingRates(true);
    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromZip: '12345', // Your business zip code
          fromCountry: 'US',
          toZip: formData.zipCode,
          toCountry: formData.country,
          weight: cartItems.length * 0.5, // Estimate 0.5 lbs per item
        }),
      });
      if (response.ok) {
        const rates = await response.json();
        setShippingRates(rates);
        if (rates.length > 0) {
          setSelectedShippingRate(rates[0]); // Select first rate by default
        }
      }
    } catch (error) {
      console.error('Failed to get shipping rates:', error);
      // Set a default shipping rate if API fails
      const defaultRate = { service: 'FEDEX_GROUND', serviceName: 'FedEx Ground', cost: 9.99, currency: 'USD' };
      setShippingRates([defaultRate]);
      setSelectedShippingRate(defaultRate);
    }
    setLoadingRates(false);
  };

  const saveSavedAddress = async (formData: CheckoutForm, shouldSave: boolean) => {
    if (!shouldSave) return;
    
    try {
      await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Shipping Address',
          recipientName: formData.customerName,
          phone: formData.customerPhone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          deliveryInstructions: formData.deliveryInstructions,
          isDefault: savedAddressesData.length === 0, // Make first address default
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };
  
  const loadSavedAddress = (addressId: string) => {
    const address = savedAddressesData.find(addr => addr.id === parseInt(addressId));
    if (address) {
      form.setValue('customerName', address.recipientName);
      form.setValue('customerPhone', address.phone);
      form.setValue('addressLine1', address.addressLine1);
      form.setValue('addressLine2', address.addressLine2 || '');
      form.setValue('city', address.city);
      form.setValue('state', address.state);
      form.setValue('zipCode', address.zipCode);
      form.setValue('country', address.country);
      form.setValue('deliveryInstructions', address.deliveryInstructions || '');
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    // Validate address first
    const isValid = await validateAddress(data);
    if (!isValid && addressValidation?.errors?.length > 0) {
      toast({
        title: "Address Validation Failed",
        description: "Please correct the address errors before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    // Save address if requested
    await saveSavedAddress(data, shouldSaveAddress);
    
    await getShippingRates(data);
    setCurrentStep('payment');
  };

  // Helper function to create order data
  const createOrderData = (payment?: any, isFailure = false) => {
    const formData = form.getValues();
    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      price: item.product.price,
    }));

    // Combine address fields for storage
    const fullShippingAddress = `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
    
    // Normalize payment status from different providers
    const normalizePaymentStatus = (status?: string) => {
      if (!status) return isFailure ? 'failed' : 'pending';
      const successStatuses = ['succeeded', 'approved', 'completed', 'paid'];
      const failureStatuses = ['failed', 'declined', 'error', 'cancelled'];
      
      const statusLower = status.toLowerCase();
      if (successStatuses.includes(statusLower)) return 'succeeded';
      if (failureStatuses.includes(statusLower)) return 'failed';
      return 'pending';
    };

    const normalizedPaymentStatus = normalizePaymentStatus(payment?.status);
    const isPaymentSuccess = normalizedPaymentStatus === 'succeeded';
    
    return {
      ...formData,
      shippingAddress: fullShippingAddress,
      subtotalAmount: subtotalAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      shippingCost: shippingAmount.toFixed(2),
      shippingMethod: selectedShippingRate?.serviceName || 'Standard Shipping',
      totalAmount: totalAmount.toFixed(2),
      orderItems,
      paymentId: payment?.paymentId || null,
      paymentStatus: normalizedPaymentStatus,
      paymentMethod: 'clover',
      status: isPaymentSuccess ? 'pending' : 'cancelled',
    };
  };

  // Separate mutation for failed payment orders (no success side effects)
  const createFailedOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to log failed order");
      }
      return response.json();
    },
    onSuccess: () => {
      // Do NOT clear cart or redirect for failed orders
      console.log("Failed order logged for admin tracking");
    },
    onError: (error) => {
      console.error("Failed to log failed order:", error);
    },
  });

  const handlePaymentSuccess = (payment: any) => {
    setPaymentData(payment);
    setIsProcessingPayment(true);
    
    const orderData = createOrderData(payment, false);
    createOrderMutation.mutate(orderData);
  };

  const handlePaymentError = (error: string) => {
    setIsProcessingPayment(false);
    
    // Log failed order for admin tracking without success side effects
    const orderData = createOrderData(null, true);
    createFailedOrderMutation.mutate(orderData);
    
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-ivory py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-playfair wine mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some beautiful crochet flowers to get started!</p>
          <Link href="/shop">
            <Button className="bg-wine hover:bg-dark-pink">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-ivory py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/cart">
            <Button variant="ghost" className="wine hover:text-dark-pink">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="font-playfair text-4xl font-bold wine mt-4">Checkout</h1>
          <p className="text-gray-600">Complete your order for beautiful handcrafted flowers</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Step Indicator */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${
                  currentStep === 'shipping' || currentStep === 'payment' ? 'text-pink-600' : 'text-gray-400'
                }`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    currentStep === 'shipping' || currentStep === 'payment' ? 'bg-pink-300 text-gray-800' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="font-medium">Shipping</span>
                </div>
                <div className={`h-px w-16 ${
                  currentStep === 'payment' ? 'bg-pink-300' : 'bg-gray-200'
                }`}></div>
                <div className={`flex items-center space-x-2 ${
                  currentStep === 'payment' ? 'text-pink-600' : 'text-gray-400'
                }`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    currentStep === 'payment' ? 'bg-pink-300 text-gray-800' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="font-medium">Payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          {currentStep === 'shipping' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
                <CardDescription>
                  Please provide your shipping details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold wine flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input
                          id="customerName"
                          data-testid="input-customer-name"
                          {...form.register("customerName")}
                          placeholder="Enter your full name"
                        />
                        {form.formState.errors.customerName && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.customerName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customerPhone">Phone Number *</Label>
                        <Input
                          id="customerPhone"
                          type="tel"
                          {...form.register("customerPhone")}
                          placeholder="+1 (555) 123-4567"
                        />
                        {form.formState.errors.customerPhone && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.customerPhone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customerEmail">Email Address *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        {...form.register("customerEmail")}
                        placeholder="your.email@example.com"
                      />
                      {form.formState.errors.customerEmail && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.customerEmail.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold wine flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </h3>
                    
                    {/* Address Selection Options */}
                    {savedAddressesData.length > 0 && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-gray-900">Address Options</h4>
                        <RadioGroup
                          value={selectedSavedAddress ? 'saved' : 'new'}
                          onValueChange={(value) => {
                            if (value === 'new') {
                              setSelectedSavedAddress('');
                              // Clear form when switching to new address
                              form.reset();
                            } else if (value === 'saved' && savedAddressesData.length > 0) {
                              const defaultAddress = savedAddressesData.find(addr => addr.isDefault) || savedAddressesData[0];
                              setSelectedSavedAddress(defaultAddress.id.toString());
                              loadSavedAddress(defaultAddress.id.toString());
                            }
                          }}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="saved" id="use-saved" data-testid="radio-use-saved-address" />
                            <Label htmlFor="use-saved" className="font-medium">
                              Use saved address
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="new" id="use-new" data-testid="radio-use-new-address" />
                            <Label htmlFor="use-new" className="font-medium">
                              Enter new address
                            </Label>
                          </div>
                        </RadioGroup>
                        
                        {/* Saved Address Dropdown - only show when saved is selected */}
                        {selectedSavedAddress && (
                          <div className="space-y-2">
                            <Label htmlFor="savedAddressSelect">Choose from your saved addresses</Label>
                            <Select
                              value={selectedSavedAddress}
                              onValueChange={(value) => {
                                setSelectedSavedAddress(value);
                                loadSavedAddress(value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a saved address" />
                              </SelectTrigger>
                              <SelectContent>
                                {savedAddressesData.map((address) => (
                                  <SelectItem key={address.id} value={address.id.toString()}>
                                    {address.isDefault && <span className="font-semibold text-wine">★ </span>}
                                    {address.name} - {address.recipientName}, {address.city}, {address.state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="addressLine1">Street Address *</Label>
                      <Input
                        id="addressLine1"
                        {...form.register("addressLine1")}
                        placeholder="123 Main Street"
                      />
                      {form.formState.errors.addressLine1 && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.addressLine1.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="addressLine2">Apartment, Suite, Unit (Optional)</Label>
                      <Input
                        id="addressLine2"
                        {...form.register("addressLine2")}
                        placeholder="Apt 2B, Suite 100, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Select
                          value={form.watch("city") || undefined}
                          onValueChange={(value) => form.setValue("city", value)}
                          disabled={!selectedState}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedState && citiesByCountryAndState[selectedCountry]?.[selectedState]?.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            )) || null}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.city && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="state">State/Province *</Label>
                        <Select
                          value={selectedState}
                          onValueChange={(value) => {
                            setSelectedState(value);
                            form.setValue("state", value);
                            // Clear city selection when state changes
                            form.setValue("city", "");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state/province" />
                          </SelectTrigger>
                          <SelectContent>
                            {statesByCountry[selectedCountry]?.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            )) || null}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.state && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.state.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                        <Input
                          id="zipCode"
                          {...form.register("zipCode")}
                          placeholder="10001"
                        />
                        {form.formState.errors.zipCode && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.zipCode.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select 
                        value={selectedCountry} 
                        onValueChange={(value) => {
                          setSelectedCountry(value);
                          setSelectedState("");
                          form.setValue("country", value);
                          // Clear state and city selection when country changes
                          form.setValue("state", "");
                          form.setValue("city", "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="MX">Mexico</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.country && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.country.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                      <Textarea
                        id="deliveryInstructions"
                        {...form.register("deliveryInstructions")}
                        placeholder="Leave at front door, Ring doorbell, etc."
                        rows={3}
                      />
                    </div>

                    {/* Address Validation Results */}
                    {addressValidation && (
                      <div className="space-y-2">
                        {addressValidation.errors?.length > 0 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              Address Issues
                            </div>
                            <ul className="text-sm text-red-600 space-y-1">
                              {addressValidation.errors.map((error: string, index: number) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {addressValidation.warnings?.length > 0 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              Please Verify
                            </div>
                            <ul className="text-sm text-yellow-600 space-y-1">
                              {addressValidation.warnings.map((warning: string, index: number) => (
                                <li key={index}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {addressValidation.isValid && addressValidation.errors?.length === 0 && addressValidation.warnings?.length === 0 && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 font-medium">
                              <Check className="h-4 w-4" />
                              Address verified successfully
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Save Address Option */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveAddress"
                        checked={shouldSaveAddress}
                        onCheckedChange={(checked) => setShouldSaveAddress(checked as boolean)}
                      />
                      <Label htmlFor="saveAddress" className="text-sm">
                        Save this address for future orders
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    data-testid="button-continue-payment"
                    className="w-full bg-wine hover:bg-dark-pink text-lg py-3"
                    disabled={loadingRates}
                  >
                    {loadingRates ? (
                      <>
                        <Package className="h-4 w-4 mr-2 animate-spin" />
                        Calculating Shipping...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Continue to Payment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              <div className="mb-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep('shipping')}
                  className="wine hover:text-dark-wine"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shipping
                </Button>
              </div>

              {/* Shipping Options */}
              {shippingRates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Choose Shipping Method
                    </CardTitle>
                    <CardDescription>
                      Select your preferred shipping option
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={selectedShippingRate?.service} 
                      onValueChange={(value) => {
                        const rate = shippingRates.find(r => r.service === value);
                        setSelectedShippingRate(rate);
                      }}
                      className="space-y-3"
                    >
                      {shippingRates.map((rate) => (
                        <div key={rate.service} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50">
                          <RadioGroupItem value={rate.service} id={rate.service} />
                          <Label htmlFor={rate.service} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{rate.serviceName}</p>
                                {rate.transitTime && (
                                  <p className="text-sm text-gray-600">
                                    Estimated delivery: {rate.transitTime} business days
                                  </p>
                                )}
                                {rate.deliveryDate && (
                                  <p className="text-sm text-gray-600">
                                    Delivery by: {rate.deliveryDate}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${rate.cost.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">{rate.currency}</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              )}

              <CloverPayment
                amount={totalAmount}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                isProcessing={isProcessingPayment}
              />
            </div>
          )}

          {/* Order Summary */}
          <Card className={currentStep === 'payment' ? 'lg:col-start-2' : ''}>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Review your items before placing the order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div className="flex gap-3">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-medium">${subtotalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Sales Tax (6.67%)</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                {selectedShippingRate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Shipping ({selectedShippingRate.serviceName})</span>
                    <span className="font-medium">${selectedShippingRate.cost.toFixed(2)}</span>
                  </div>
                )}
                {!selectedShippingRate && currentStep === 'shipping' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Shipping</span>
                    <span className="font-medium text-gray-500">Calculated next step</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold wine border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedShippingRate ? 
                    `Shipping via ${selectedShippingRate.serviceName}. Handcrafted with love and delivered with care.` :
                    "Shipping cost will be calculated based on your address. Handcrafted with love and delivered with care."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}