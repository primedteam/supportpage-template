<script>
    jQuery(document).ready(function(){
        var validator = $("<?php echo $validator['selector']; ?>").validate({
            rules: <?php echo json_encode($validator['rules']); ?>
        });

        // Element we want to validate might not actually exist.
        if (typeof validator !== 'undefined') {
            // Enable custom submit handler.
            validator.cancelSubmit = true;
        }
    });
</script>
