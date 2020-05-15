import { ApplicationObj } from '../../main';
import { Controller } from 'stimulus';
import Vue from 'vue';
import VeeValidate from 'vee-validate';
import { MemberShipQueryParam } from '../../interfaces/membership.interface';
import { getMembershipListing, submitMembershipData } from '../../services/membership.service';
import { isNull, getCookieJSON, triggerEventByCtrlName } from '../../util';
import { URC_Cookie, GetProfileRequest, ApiResponse } from '../../models/social-api-model';
import { getProfileUser, checkPinExist } from '../../services/user.service';
import { StateCityQueryParams, CityApiRespone, City } from '../../interfaces/state-city';
import { StateApiRespone } from '../../interfaces/state-city';
import { getStates, getCities } from '../../services/address.service';
import { State } from '../../interfaces/state-city';
import { UserProfile } from '../../models/user.profile';
import PerfectScrollbar from 'perfect-scrollbar';

declare global {
  interface Window {
    ga: any
  }
}

const dictionary = {
  en: {
    messages: {
      required: function (fieldName: string) {
        return "Field is required";
      },
      email: function () {
        return "Invalid email";
      },
      is_not: function () {
        return "Field is required"
      }
    }
  }
};

VeeValidate.Validator.localize(dictionary);
Vue.use(VeeValidate);

VeeValidate.Validator.extend('gst_pattern', {
  getMessage: () => {
    return `Please enter a proper GST format`;
  },
  validate: (value: any) => {
    var strongRegex = new RegExp("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$");
    return strongRegex.test(value);
  }
});

class WidgetLayout24 extends Controller {
  purchasePopupTarget: HTMLElement;
  knowMorePopupTarget: HTMLElement;
  listingsVue: any;
  purchasePopupVue: any;
  userData: ApiResponse

  static targets = ["purchasePopup", "knowMorePopup"];

  connect() {
    this.initListingsVue();
    this.initPurchasePopupVue();
  }


  async getUserData() {
    let userProfile = UserProfile.getInstance()
    if (isNull(userProfile.userData)) {
      console.log('User-Data-Membership: ', `${new Date()} - ${userProfile.isFetching}`)
      userProfile.userData = await userProfile.fetchUserData()
    }
    this.userData = userProfile.userData
    // console.log('User-Data-M: ', userData)
  }


  preventDefaultGrp(e: any) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  scrollToMembership(e: any) {
    let currentTargetData = e.currentTarget.getAttribute("data-type");
    let elmnt = document.getElementById(currentTargetData)!;
    $([document.documentElement, document.body]).animate({
      scrollTop: $(elmnt)!.offset()!.top - 60
    }, 2000);
  }

  removeOuterClasses(e: any) {
    let cTarget = e.currentTarget;
    if (cTarget.classList.contains("skip")) {
      cTarget = cTarget.parentElement.parentElement.parentElement.parentElement;
    }
    if (cTarget.classList.contains("blue")) {
      cTarget.classList.remove("blue");
    }
    if (cTarget.classList.contains("silver")) {
      cTarget.classList.remove("silver");
    }
    if (cTarget.classList.contains("gold")) {
      cTarget.classList.remove("gold");
    }
    if (cTarget.classList.contains("platinum")) {
      cTarget.classList.remove("platinum");
    }
    if (cTarget.classList.contains("diamond")) {
      cTarget.classList.remove("diamond");
    }
  }

  closeKnowMore(e: any) {
    this.preventDefaultGrp(e);
    this.knowMorePopupTarget.classList.remove("show");
    document.body.classList.remove("no-scroll");
  }

  resetForms() {
    return false;
    if (!isNull(this.listingsVue)) {
      this.listingsVue.reset()
    }

    if (!isNull(this.purchasePopupVue)) {
      this.purchasePopupVue.reset()
    }
  }

  resetEditView() {
    document.getElementById("purchasePopupVue")!.querySelectorAll("input").forEach((el) => {
      if (!el.classList.contains("forever-disabled")) {
        el.disabled = false;
      }
    });
    document.getElementById("purchasePopupVue")!.querySelectorAll("select").forEach((el) => {
      if (!el.classList.contains("forever-disabled")) {
        el.disabled = false;
      }
    });
    document.getElementById("editButton")!.style.display = "none";
  }

  closePurchasePopup(e: any) {
    this.preventDefaultGrp(e);
    this.purchasePopupTarget.classList.remove("show");
    document.body.classList.remove("no-scroll");
    this.removeOuterClasses(e);
    this.resetForms();
    this.resetEditView();
    this.purchasePopupVue.$data.categories = [];
    this.purchasePopupVue.$data.sizes = [];
    document.getElementById("continueButton")!.classList.add("toEdit");
    document.getElementById("HeadOne")!.style.display = "block";
    document.getElementById("HeadTwo")!.style.display = "none";
  }

  closeWhenClickedOut(e: any) {
    return false;
    this.preventDefaultGrp(e);
    if (e.target.classList.contains("modal-membership")) {
      this.closeKnowMore(e);
      this.closePurchasePopup(e);
    }
  }

  toggleSizeChart(e: any) {
    this.preventDefaultGrp(e);
    if (e.currentTarget.classList.contains("show")) {
      e.currentTarget.classList.remove("show");
    } else {
      e.currentTarget.classList.add("show");
    }
  }

  initListingsVue() {
    let context = this;

    let vueData = {
      initialListingData: [],
      userGuid: "",
      userProfileData: {},
      cardtype: '',
      status: '',
      campaign_id: '',
      userData: this.userData
    };

    this.listingsVue = new Vue({
      el: "#cardsVue",
      data: vueData,
      methods: {
        async getProfileUserData() {
          let userProfile = UserProfile.getInstance()
          if (isNull(userProfile.userData)) {
            userProfile.userData = await userProfile.fetchUserData()
          }
          context.userData = userProfile.userData
          let responseData = context.userData
          if (!isNull(responseData) && !isNull(responseData.data)) {
            context.purchasePopupVue.$data.email = responseData.data.email_id;
            context.purchasePopupVue.$data.fullName = responseData.data.user.name;
            context.purchasePopupVue.$data.mobile = responseData.data.user.mobile_no!;
            context.purchasePopupVue.$data.addressOne = responseData.data.user.address!;
            context.purchasePopupVue.$data.cityName = responseData.data.user.city!;
            context.purchasePopupVue.$data.cityId = responseData.data.user.city_id!;
            context.purchasePopupVue.$data.stateName = responseData.data.user.state!;
            context.purchasePopupVue.$data.stateId = responseData.data.user.state_id!;
            context.purchasePopupVue.onStateChange();
            this.status = responseData.data.user.campaign_json!.status!;
            this.cardtype = responseData.data.user.campaign_json!.product_name!;
            this.campaign_id = responseData.data.user.campaign_id!
          }
          // display user's membership
          this.checkAndDisplayMembership()
        },
        async getListingData() {
          let queryParams: MemberShipQueryParam = {
            pgnum: "1",
            inum: "10",
            pgsize: "10",
            p_product_typeid: "",
            entities: document.getElementById("membershipTopDiv")!.getAttribute("data-entityType")!,
            otherent: "",
            p_searchkeyword: ""
          }
          let apiResponse = await getMembershipListing(queryParams);
          if (!isNull(apiResponse) && !isNull(apiResponse.data)) {
            this.initialListingData = apiResponse.data.reverse();

            this.initialListingData.forEach((el: any) => {
              if (el.skujson[0].product_price == 0) {
                el.skujson[0].product_price = "Free";
              } else {
                el.skujson[0].product_price = `Rs. ${el.skujson[0].product_price.toLocaleString()}`
              }
            });

            this.initialListingData.forEach((el: any) => {
              let basePath = document.getElementById("membershipTopDiv")!.getAttribute("data-imagePath");
              el.imagePathEx = `${basePath}waf-images/${el.imagedata[0].image_path}${el.imagedata[0].image_file_name}`;
              el.descriptionArray = el.short_desc.split("||");
            });
          }
          document.getElementById("cardsVue")!.style.display = "block";
        },
        checkAndDisplayMembership() {
          //user may be paid member
          if (this.status == '1') {
            document.getElementById("cardsVue")!.classList.add("member-active");
            $('#diamondBtn').remove()
            $('#platinumBtn').remove()
            $('#goldBtn').remove()
            $('#silverBtn').remove()
            $('#blueBtn').remove()
            if (this.campaign_id == '6') {
              document.getElementById("diamond-membership-card")!.classList.add("active");

            } else if (this.campaign_id == '5') {
              document.getElementById("platinum-membership-card")!.classList.add("active");

            } else if (this.campaign_id == '4') {
              document.getElementById("gold-membership-card")!.classList.add("active");

            } else if (this.campaign_id == '3') {
              document.getElementById("silver-membership-card")!.classList.add("active");

            }
          } else if (this.status == '2') {
            //user has pending payment
            document.getElementById("cardsVue")!.classList.add("member-active");
            $('#diamondBtn').remove()
            $('#platinumBtn').remove()
            $('#goldBtn').remove()
            $('#silverBtn').remove()
            $('#blueBtn').remove()
          } else if (this.status == '3') {
            //user has not loginned yet
            // document.getElementById("cardsVue")!.classList.add("member-active");
          } else if (this.status == '4') {
            //user has blue card 
            document.getElementById("blue-membership-card")!.classList.add("active");
            $('.card-list .btn-gold').text('UPGRADE')
            $('#blueBtn').remove()
          }
        },
        buyNowPopupOpen(e: any) {
          context.preventDefaultGrp(e);
          let userCookie = getCookieJSON<URC_Cookie>("_URC")!;
          if (isNull(userCookie)) {
            // Show the login popup
            triggerEventByCtrlName("si-ads--widget-layout-01", "open-signin-modal");
            return false;
          } else {
            if (getCookieJSON<URC_Cookie>("_URC")!.status != "999") {
              // Go about opening the purchase popup
              this.openPurchasePopup(e);
              $('.user-registration.custom-form').removeClass('form-disabled')
            } else {
              document.getElementById("verificationForm")!.classList.add("show");
              document.body.classList.add("no-scroll");
            }
          }
          window.ga('send', {
            hitType: 'event',
            eventCategory: 'MembershipBuyNow',
            eventAction: 'click',
            eventLabel: 'Click membership buy now'
          })
        },
        knowMorePopupOpen(e: any) {
          context.preventDefaultGrp(e);
          let dataType = e.currentTarget.getAttribute("data-type");
          this.initialListingData.forEach((el: any) => {
            if (el.title_alias == dataType) {
              document.getElementById("knowMoreContentBody")!.innerHTML = el.description;

              context.knowMorePopupTarget.classList.add("show");
              document.body.classList.add("no-scroll");
              let scrollContainer = document.querySelector('.content-body-selector-two') as HTMLElement
              new PerfectScrollbar(scrollContainer);
            }
          });
        },
        openPurchasePopup(e: any) {
          context.preventDefaultGrp(e);
          // Call getProfile API and populate the upper section
          this.getProfileUserData();

          let classToAdd = "";
          let textToAdd = "";
          let dataType = e.currentTarget.getAttribute("data-type");
          this.initialListingData.forEach((el: any) => {
            if (el.title_alias == dataType) {
              context.purchasePopupVue.$data.selectedCardOptions = el;
              context.purchasePopupVue.$data.selectedCardOptions.customizejson.forEach((elm: any) => {
                elm.type = el.title_alias;
              });
              context.purchasePopupVue.$data.categories = [];
              context.purchasePopupVue.$data.sizes = [];
              for (let x = 0; x < context.purchasePopupVue.$data.selectedCardOptions.customizejson.length; x++) {
                context.purchasePopupVue.$data.categories.push("adult");
                context.purchasePopupVue.$data.sizes.push("S");
              }
            }
          });

          let catHtml2append = `
            <option value="adult">Adult</option>
            <option value="child" v-if="option.customize_name != 'MI R Elan Jacket'">Child</option>
          `;
          let cat2Html2append = `
            <option value="adult">Adult</option>
          `;
          let sizHtml2append = `
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          `;

          document.querySelectorAll(".categoryDD").forEach((el: any) => {
            if (el.classList.contains('jacket')) {
              el.innerHTML = cat2Html2append;
            } else {
              el.innerHTML = catHtml2append;
            }
          });

          document.querySelectorAll(".sizeDD").forEach((el: any) => {
            el.innerHTML = sizHtml2append;
          });

          switch (dataType) {
            case "blue-membership-card":
              classToAdd = "blue";
              textToAdd = "Blue ";
              break;
            case "silver-membership-card":
              classToAdd = "silver";
              textToAdd = "Silver ";
              break;
            case "gold-membership-card":
              classToAdd = "gold";
              textToAdd = "Gold ";
              break;
            case "platinum-membership-card":
              classToAdd = "platinum";
              textToAdd = "Platinum ";
              break;
            case "diamond-membership-card":
              classToAdd = "diamond";
              textToAdd = "Diamond ";
              break;
            default:
              return false;
          }

          document.querySelector(".purchase-popup-outer")!.classList.add(classToAdd);
          document.querySelector(".membershipTitle")!.innerHTML = textToAdd;
          document.querySelector(".membershipTitleTwo")!.innerHTML = textToAdd;
          context.purchasePopupTarget.classList.add("show");
          document.body.classList.add("no-scroll");
          let scrollContainer = document.querySelector('.content-body-selector-one') as HTMLElement
          new PerfectScrollbar(scrollContainer);
        },
        async initMembership() {
          // Get the membership listing data   
          await this.getListingData();
          await this.getProfileUserData();
        }
      },
      mounted() {
        this.initMembership()
      }
    });
  }

  initPurchasePopupVue() {
    let context = this;

    let vueData = {
      fullName: "",
      email: "",
      mobile: "",
      addressOne: "",
      addressTwo: "", // addressTwo is not returned through getProfile
      district: "", // district is not returned through getProfile
      landmark: "", // landmark is not returned through getProfile
      cityName: "",
      cityId: "",
      stateName: "",
      stateId: "",
      pincode: "",
      statedropdownHtml: "",
      citydropdownHtml: "",
      ispinnotverified: true,
      termsAndCondition: "",
      selectedCardOptions: [] as any,

      categories: [
        "adult",
        "adult",
        "adult"
      ],
      sizes: [
        "S",
        "S",
        "S"
      ],

      gst: ""
    };

    this.purchasePopupVue = new Vue({
      el: "#purchasePopupVue",
      data: vueData,
      methods: {
        editBack(e: any) {
          context.preventDefaultGrp(e);
          $('.user-registration.custom-form').removeClass('form-disabled')
          document.getElementById("purchasePopupVue")!.querySelectorAll("input").forEach((el) => {
            if (!el.classList.contains("forever-disabled")) {
              el.disabled = false;
            }
          });
          document.getElementById("purchasePopupVue")!.querySelectorAll("select").forEach((el) => {
            if (!el.classList.contains("forever-disabled")) {
              el.disabled = false;
            }
          });
          document.getElementById("HeadTwo")!.style.display = "none";
          document.getElementById("HeadOne")!.style.display = "block";
          document.getElementById("editButton")!.style.display = "none";
          document.getElementById("continueButton")!.classList.add("toEdit");
          document.getElementById("continueButton")!.innerText = "Continue";
        },
        //verify pin
        async verifyPinCode(e: any) { // called on blur

          if (e.currentTarget.value.trim() == "") {
            e.currentTarget.previousElementSibling.classList.remove("active");
            e.currentTarget.previousElementSibling.classList.remove("show");
          }
          let valid = true;
          if (this.errors.items.length > 0) {
            this.errors.items.forEach((el) => {
              if (el.field == "Pincode") {
                valid = false;
              }
            });
          }
          if (valid) {
            // verify pin
            let queryParam = {
              pincode: this.pincode
            };
            let verifiedPinResponse: any = await checkPinExist(queryParam);
            if (!isNull(verifiedPinResponse) && !isNull(verifiedPinResponse.content)) {
              if (!isNull(verifiedPinResponse.content.pincodedata) && this.pincode != "") {
                document.getElementById("pinVerifErrorSpan")!.classList.remove("show");
                this.ispinnotverified = false
              } else if (isNull(verifiedPinResponse.content.pincodedata) && this.pincode != "") {
                this.ispinnotverified = true
                document.getElementById("pinCode")!.focus();
                document.getElementById("pinVerifErrorSpan")!.classList.add("show");
                setTimeout(function () {
                  document.getElementById("pinVerifErrorSpan")!.classList.remove("show");
                }, 2000);
              }
            }
          }
        },
        continueClick(e: any) {
          context.preventDefaultGrp(e);
          this.verifyPinCode(e);
          this.$validator.validate().then(async () => {
            if (this.errors.items.length == 0) {
              if (this.ispinnotverified) {
                document.getElementById("pinVerifErrorSpan")!.classList.add("show");
                setTimeout(function () {
                  document.getElementById("pinVerifErrorSpan")!.classList.remove("show");
                }, 2000);
                return;
              }
              if (e.currentTarget.classList.contains("toEdit")) {
                document.getElementById("HeadTwo")!.style.display = "block";
                document.getElementById("HeadOne")!.style.display = "none";
                e.currentTarget.innerText = "Pay Now"
                document.getElementById("purchasePopupVue")!.querySelectorAll("input").forEach((el) => {
                  if (!el.classList.contains("forever-disabled")) {
                    el.disabled = true;
                  }
                });
                document.getElementById("purchasePopupVue")!.querySelectorAll("select").forEach((el) => {
                  if (!el.classList.contains("forever-disabled")) {
                    el.disabled = true;
                  }
                });
                document.getElementById("editButton")!.style.display = "inline-block";
                e.currentTarget.classList.remove("toEdit");
              } else {
                this.submitMembershipForm();
              }
              $('.user-registration.custom-form').addClass('form-disabled')
              $('.modal-content').animate({
                scrollTop: 0
              }, 500);
            }
          });

          window.ga('send', {
            hitType: 'event',
            eventCategory: 'MembershipPayNow',
            eventAction: 'click',
            eventLabel: 'Click membership pay now'
          })

        },


        async submitMembershipForm() {
          let payload = {
            product_id: "",
            is_login_user: 1,
            cartdetails: [
              // Into cart details, put data in following format
              /*
                {
                  product_price: 1,
                  product_sku_id: 3,
                  quantity: 1,
                  customize_type_id: "1",
                  customize_text: "Mi jery 1",
                  category: "adult",
                  size: "M",
                  Product_Id: 3
                },
              */
            ] as any,
            shipmentadd: {
              billing_name: this.fullName,
              total_amount: 0,
              billing_city_id: this.cityId,
              billing_pincode: this.pincode,
              billing_country_id: "101",
              billing_address1: this.addressOne,
              billing_address2: this.addressTwo,
              billing_district: this.district,
              billing_landmark: this.landmark,
              billing_state_id: this.stateId,
              is_shipment_billing_address_same: 1,
              gst_no: this.gst
            }
          };
          payload.product_id = this.selectedCardOptions.product_id;
          payload.shipmentadd.total_amount = this.selectedCardOptions.skujson[0].product_price;
          // Add the clothing details
          this.selectedCardOptions.customizejson.forEach((el: any, index: number) => {
            payload.cartdetails.push({
              product_price: this.selectedCardOptions.skujson[0].product_price,
              product_sku_id: this.selectedCardOptions.skujson[0].product_sku_id,
              quantity: 1,
              customize_type_id: el.product_customize_id,
              customize_text: el.customize_name,
              category: this.categories[index],
              size: this.sizes[index],
              Product_Id: el.product_id
            });
          });
          let membershipResponse = await submitMembershipData(payload);
          if (!isNull(membershipResponse) && !isNull(membershipResponse.content) && !isNull(membershipResponse.content.data)) {
            if (membershipResponse.content.data.product_cart_id > 0) {
              location.pathname = "/payment";
            }
          }
        },

        focussed(e: any) {
          if (e.currentTarget.value.trim() == "") {
            e.currentTarget.previousElementSibling.classList.add("active");
            e.currentTarget.previousElementSibling.classList.add("show");
          }
        },
        blurred(e: any) {
          if (e.currentTarget.value.trim() == "") {
            e.currentTarget.previousElementSibling.classList.remove("active");
            e.currentTarget.previousElementSibling.classList.remove("show");
          }
        },
        onStateChange: async function () {
          if (!isNull(this.stateId)) {
            let stateIdValue = this.stateId
            let queryParam: StateCityQueryParams = {
              country_id: 101,
              state_id: parseInt(stateIdValue)
            }
            let cityResponsedata: CityApiRespone = await getCities(queryParam)
            let arrayOfCityObject: City[] = cityResponsedata.cities;
            let listOfCities = arrayOfCityObject.map(function (cityObject: City) {
              return `<option value="${cityObject.city_id}">${cityObject.name}</option>`
            });
            this.citydropdownHtml = listOfCities.join(" ").toString()
          }
        },
        categoryChange: function (e: any) {
          let no = e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute("data-merchtypeid");
          let html2append = "";
          if (e.target.value == "child") {
            html2append = `
              <option value="8-10years">8-10 years</option>
              <option value="11-13years">11-13 years</option>
            `;
            // e.currentTarget.parentElement.parentElement.parentElement.nextElementSibling.querySelector("select").value = "8-10years";
            this.sizes[Number(no)] = "8-10years";
            e.currentTarget.parentElement.parentElement.parentElement.nextElementSibling.querySelector("select").innerHTML = html2append;
          } else if (e.target.value == "adult") {
            html2append = `
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            `;
            // e.currentTarget.parentElement.parentElement.parentElement.nextElementSibling.querySelector("select").value = "S";
            this.sizes[Number(no)] = "S";
            e.currentTarget.parentElement.parentElement.parentElement.nextElementSibling.querySelector("select").innerHTML = html2append;
          }
        }
      },
      async mounted() {
        let queryParam: StateCityQueryParams = {
          country_id: 101
        }
        let stateResponsedata: StateApiRespone = await getStates(queryParam)
        let arrayOfStateObject: State[] = stateResponsedata.states;
        let listOfStates = arrayOfStateObject.map(function (stateObject: State) {
          return `<option value="${stateObject.state_id}">${stateObject.name}</option>`
        });
        this.statedropdownHtml = listOfStates.join(" ").toString()
      }
    });
  }

}

export default () => ApplicationObj.register('si-custom--widget-layout-24', WidgetLayout24);