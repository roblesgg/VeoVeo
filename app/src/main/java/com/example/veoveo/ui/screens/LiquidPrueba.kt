import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.veoveo.ui.screens.MainScreen
import io.github.fletchmckee.liquid.LiquidState
import io.github.fletchmckee.liquid.liquid
import io.github.fletchmckee.liquid.rememberLiquidState
import io.github.fletchmckee.liquid.liquefiable

@Composable
fun LiquidPrueba(
    modifier: Modifier = Modifier,
    liquidState: LiquidState = rememberLiquidState(),
) = Box(modifier) {
    // Content layer for `liquefiable` source nodes
    ImageBackground(
        Modifier
            .fillMaxSize()
            .liquefiable(liquidState),
    )
    // Control layer for `liquid` effect nodes
    LiquidButton(
        Modifier
            .align(Alignment.TopStart)
            .liquid(liquidState),
    )
}

@Composable
fun LiquidButton(x0: Modifier) {
    TODO("Not yet implemented")
}

@Composable
fun ImageBackground(x0: Modifier) {
    TODO("Not yet implemented")
}

// Vista previa
@Preview(showBackground = true)
@Composable
fun LiquidPruebaPreview() {
    LiquidPrueba()
}