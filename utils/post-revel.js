module.exports = {
  getRevelPost: function(user) {
    var postData = {
      accept_checks: false,
      accept_checks: false,
      account_balance: null,
      birth_date: user.dob.toString(),
      account_limit: null,
      active: true,
      city: "",
      created_by: "/enterprise/User/4/",
      customer_groups: [],
      deleted: false,
      discount: null,
      email: user.primary_email.toString(),
      exp_date: null,
      first_name: user.firstname.toString(),
      gender: null,
      is_visitor: false,
      last_name: user.lastname.toString(),
      lic_number: "",
      loyalty_number: "",
      loyalty_ref_id: "",
      notes: "Added from Smartwaiver Webhook",
      ok_to_email: true,
      past_due: null,
      phone_number: user.phone.toString(),
      ref_number: user.participant_id.toString(),
      reward_card_numbers: [],
      source: 0,
      state: "",
      tax_exempt: false,
      tax_location: null,
      third_party_id: null,
      title: "",
      total_purchases: 0,
      total_visits: 0,
      track_as_company: false,
      updated_by: "/enterprise/User/32/",
      uuid: "",
      vehicles: [],
      zipcode: ""
    }

    var options = {
      url: 'https://wealthshop.revelup.com/resources/Customer/',
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'API-AUTHENTICATION': process.env.REVEL_API_PUB + ':' + process.env.REVEL_API_SEC
      },
      data: JSON.stringify(postData),
      verbose: true,
    }

    return options;
  }
}
